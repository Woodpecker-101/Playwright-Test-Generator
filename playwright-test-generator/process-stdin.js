import { parseMarkdownForTests } from './markdown-parser.js';
import { logInfo, logWarn, logError } from './utils.js';

/**
 * Processes stdin input, parses Markdown, and invokes the provided callback with parsed scenarios.
 * @param {Function} generateTestFiles - Callback to generate test files from parsed scenarios.
 * @returns {void}
 */
export const processStdin = (generateTestFiles) => {
    let input = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', chunk => {
        input += chunk;
    });

    process.stdin.on('end', () => {
        if (input.trim()) {
            logInfo(`Final stdin input received. Parsing Markdown content...`);
            const parsedData = parseMarkdownForTests(input);
            if (parsedData) {
                logInfo(`Parsed Data: ${JSON.stringify(parsedData)}`);

                const scenarios = parsedData.reduce((acc, row) => {
                    const feature = row['Feature Name'];
                    const testScenario = row['Scenario Name'];
                    const testCase = row['Test Name'];
                    let flowName = row['Flow Name'];
                    if (!flowName) flowName = '__NO_FLOW__';
                    const stepName = row['Step Name'];
                    const pageName = row['Page Name'];
                    const target = row['Target'];

                    if (!feature || !testCase || !stepName) {
                        logWarn(`Skipping incomplete row: ${JSON.stringify(row)}`);
                        return acc;
                    }

                    let scenario = acc.find(s => s.feature === feature && s.testCase === testCase && s.testScenario === testScenario);

                    if (!scenario) {
                        scenario = { feature, testScenario, testCase, flows: [], allFlows: [], orderedSteps: [], steps: [] };
                        acc.push(scenario);
                    }

                    let flowBeforeGroup = scenario.flows.find(f => f.name === flowName);
                    if (!flowBeforeGroup) {
                        flowBeforeGroup = { name: flowName, steps: [] };
                        scenario.flows.push(flowBeforeGroup);
                    }
                    flowBeforeGroup.steps.push({ name: stepName, page: pageName, target });

                    // Add to scenario.steps (flat array of step objects)
                    scenario.steps.push({ name: stepName, page: pageName, target });

                    // Collect all flow names as objects with a `name` property, avoiding consecutive duplicates
                    if (!scenario.allFlows.length || scenario.allFlows[scenario.allFlows.length - 1].name !== flowName) {
                        scenario.allFlows.push({ name: flowName });
                    }

                    // Add ordered step for test case generation
                    scenario.orderedSteps.push({
                        flowName,
                        stepName,
                        pageName,
                        target
                    });

                    return acc;
                }, []);

                // Extract all flows from scenarios
                const allFlows = scenarios.flatMap(scenario => scenario.flows);
                logInfo(`All Flows: ${JSON.stringify(allFlows, null, 2)}`);

                // Group and validate flows
                const validatedFlows = groupAndValidateFlows(allFlows);
                logInfo(`Validated Flows: ${JSON.stringify(validatedFlows, null, 2)}`);

                // Replace scenario.flows with validated flows
                scenarios.forEach(scenario => {
                    scenario.flows = validatedFlows.filter(validatedFlow =>
                        scenario.flows.some(flow => flow.name === validatedFlow.name)
                    );
                });

                logInfo(`Updated Scenarios with Validated Flows: ${JSON.stringify(scenarios, null, 2)}`);

                // Log all flow names per test case for debugging
                scenarios.forEach(scenario => {
                    logInfo(`All flow names for test case "${scenario.testCase}": ${JSON.stringify(scenario.allFlows)}`);
                });

                generateTestFiles(scenarios);
            } else {
                logError('No valid scenarios found in stdin markdown content.');
            }
        } else {
            logError('No input received from stdin.');
        }
    });
};

export const groupAndValidateFlows = (flows) => {
    const groupedFlows = flows.reduce((map, flow) => {
        if (!map.has(flow.name)) {
            map.set(flow.name, []);
        }
        map.get(flow.name).push(flow.steps);
        return map;
    }, new Map());

    const validatedFlows = Array.from(groupedFlows.entries()).map(([flowName, stepsArrays]) => {
        const combinedSteps = stepsArrays.flat();
        const length = combinedSteps.length;

        let validSequence = null;

        // Try dividing the array into equal parts to find repeated sequences
        for (let parts = 2; parts <= length; parts++) {
            if (length % parts !== 0) continue;

            const partLength = length / parts;
            let isRepeated = true;

            for (let i = 1; i < parts; i++) {
                const start = i * partLength;
                const currentPart = combinedSteps.slice(start, start + partLength);
                const firstPart = combinedSteps.slice(0, partLength);

                if (JSON.stringify(currentPart) !== JSON.stringify(firstPart)) {
                    isRepeated = false;
                    break;
                }
            }

            if (isRepeated) {
                validSequence = combinedSteps.slice(0, partLength);
                break;
            }
        }

        // If no repeated sequence is found, keep the flow as-is
        if (!validSequence) {
            logWarn(`Flow ${flowName} has no repeated sequence. Keeping as-is.`);
            validSequence = combinedSteps;
        } else {
            logInfo(`Flow ${flowName} has repeated sequence. Keeping only one sequence.`);
        }

        return { name: flowName, steps: validSequence };
    });

    return validatedFlows;
};