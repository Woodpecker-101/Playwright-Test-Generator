import fs from 'fs';
import path from 'path';
import { generateActions } from './generate-actions.js';
import { generateFlows } from './generate-flows.js';
import { generatePages } from './generate-pages.js';
import { processStdin } from './process-stdin.js';
import { generateTestCases } from './generate-test-cases.js';
import { addHooks } from './add-hooks.js';
import { config } from './config.js';
import { toKebabCase, logInfo, logWarn, logError } from './utils.js';

/**
 * Validates a name for a given type, ensuring it contains only allowed characters.
 * @param {string} name - The name to validate.
 * @param {string} type - The type of the name (e.g., 'Feature').
 * @throws {Error} If the name is invalid.
 */
const validateName = (name, type) => {
  const invalidChars = /[^a-zA-Z0-9_\s]/;
  if (!name || invalidChars.test(name)) {
    throw new Error(`${type} name is invalid: '${name}'. Only alphanumeric characters, spaces, and underscores are allowed.`);
  }
};

/**
 * Generates all test files (pages, actions, flows, test cases, hooks) for provided scenarios.
 * @param {Array} scenarios - Array of scenario objects to generate files for.
 * @param {string} basePath - The base directory path for generated files.
 * @returns {void}
 */
const generateTestFiles = (scenarios, basePath) => {
  if (!Array.isArray(scenarios)) {
    logError('Invalid input: scenarios is not an array', scenarios);
    return;
  }
  logInfo('Generate Test Case Scenarios:', JSON.stringify(scenarios, null, 2));

  const baseDir = path.resolve(basePath);

  // Group scenarios by feature name
  const featureMap = scenarios.reduce((acc, scenario) => {
    if (!scenario.feature) return acc;
    if (!acc[scenario.feature]) {
      acc[scenario.feature] = { steps: [], flows: [], scenarios: [] };
    }
    acc[scenario.feature].steps.push(...(scenario.steps || []));
    acc[scenario.feature].flows.push(...(scenario.flows || []));
    acc[scenario.feature].scenarios.push(scenario);
    return acc;
  }, {});

  Object.entries(featureMap).forEach(([feature, data]) => {
    try {
      validateName(feature, 'Feature');
      const featureDir = path.join(baseDir, toKebabCase(feature));
      logInfo(`Creating feature directory: ${featureDir}`);
      fs.mkdirSync(featureDir, { recursive: true });

      generatePages(featureDir, data.steps);
      generateActions(featureDir, data.steps);

      // For flows and test cases, still process per scenario
      data.scenarios.forEach(scenario => {
        generateFlows(featureDir, scenario.flows, feature);
        generateTestCases(featureDir, scenario);
      });
    } catch (error) {
      logError(`Error processing feature: ${feature}.`, error);
    }
  });

  // Add hooks to test files
  scenarios.forEach((scenario) => {
    const featureDir = path.join(baseDir, toKebabCase(scenario.feature));
    if (!scenario.feature) {
      logError('Skipping scenario due to missing feature name:', scenario);
      return;
    }
    addHooks(featureDir, scenario);
  });
};

// Extract --basePath argument from process.argv
const basePathArg = process.argv.find(arg => arg.startsWith('--basePath='))?.split('=')[1];

// Determine the basePath: prioritize command-line argument, then fallback to config.basePath, and default to './' if neither is provided.
const basePath = basePathArg || config.basePath || './';
logInfo(`Using basePath for file generation: ${basePath}`);

const filePath = process.argv[2];
if (filePath) {
  const absolutePath = path.resolve(filePath);
  const input = fs.readFileSync(absolutePath, 'utf8');
  process.stdin.push(input);
  process.stdin.push(null);
}

processStdin((scenarios) => {
  try {
    generateTestFiles(scenarios, basePath);
  } catch (error) {
    logError('Error generating test files:', error);
  }
});
