import fs from 'fs';
import path from 'path';
import { toPascalCase, toCamelCase, toKebabCase, logInfo, logWarn, logError, safeWriteFile, safeReadFile } from './utils.js';

/**
 * Generates or updates test case files for a given scenario.
 * @param {string} featureDir - The directory where the feature's files are stored.
 * @param {Object} testScenario - The scenario object containing feature, testCase, allFlows, and flows.
 * @returns {void}
 */
export const generateTestCases = (featureDir, testScenario) => {
  if (!featureDir || typeof featureDir !== 'string') {
    logError('Invalid or missing featureDir in generateTestCases:', featureDir);
    return;
  }
  if (!testScenario || typeof testScenario !== 'object') {
    logError('Invalid or missing testScenario in generateTestCases:', testScenario);
    return;
  }
  if (!Array.isArray(testScenario.allFlows) || testScenario.allFlows.length === 0) {
    logError('Invalid or missing allFlows in testScenario for generateTestCases:', testScenario.allFlows);
    return;
  }
  if (!Array.isArray(testScenario.flows) || testScenario.flows.length === 0) {
    logError('Invalid or missing flows in testScenario for generateTestCases:', testScenario.flows);
    return;
  }
  if (!testScenario.feature || typeof testScenario.feature !== 'string') {
    logError('Invalid or missing feature in testScenario for generateTestCases:', testScenario.feature);
    return;
  }
  if (!testScenario.testScenario || typeof testScenario.testScenario !== 'string') {
    logError('Invalid or missing testScenario name in testScenario for generateTestCases:', testScenario.testScenario);
    return;
  }
  if (!testScenario.testCase || typeof testScenario.testCase !== 'string') {
    logError('Invalid or missing testCase in testScenario for generateTestCases:', testScenario.testCase);
    return;
  }
  const testFileDir = path.join(featureDir, 'tests');
  fs.mkdirSync(testFileDir, { recursive: true });
  const testFilePath = path.join(testFileDir, `${toKebabCase(testScenario.testScenario)}.test.ts`);

  if (!fs.existsSync(testFilePath)) {
    logInfo(`Test file does not exist: ${testFilePath}`);
    const orderedSteps = testScenario.orderedSteps || [];
    let lastFlow = null;
    const testBody = orderedSteps.map(step => {
      if (step.flowName && step.flowName !== '__NO_FLOW__') {
        if (lastFlow !== step.flowName) {
          lastFlow = step.flowName;
          return `await flow.${toCamelCase(step.flowName)}();`;
        }
        return null;
      }
      if (!step.pageName) return `// ${step.stepName}() { /* Page or page name is undefined */ }`;
      return `await flow.${toCamelCase(step.pageName)}Action.${toCamelCase(step.stepName)}(); // Action: ${step.pageName}`;
    }).filter(Boolean).join('\n    ');
    const testFileContent = `import { test } from '@playwright/test';
import { ${toPascalCase(testScenario.feature)}Flow } from '../${toKebabCase(testScenario.feature)}.flow';

test.describe('${testScenario.testScenario}', () => {
  let flow: ${toPascalCase(testScenario.feature)}Flow;

  test.beforeEach(async ({ page }) => {
    flow = new ${toPascalCase(testScenario.feature)}Flow(page);
    // Add any setup code here if needed
  });

  test('${testScenario.testCase}', async ({ page }) => {
    ${testBody}
  });
});`;
    safeWriteFile(testFilePath, testFileContent);
    logInfo(`Test file created: ${testFilePath}`);
  }
  logInfo(`Test file exists: ${testFilePath}`);
  const existingTestFileContent = safeReadFile(testFilePath) || '';
  const orderedSteps = testScenario.orderedSteps || [];
  let lastFlow = null;
  const testBody = orderedSteps.map(step => {
    if (step.flowName && step.flowName !== '__NO_FLOW__') {
      if (lastFlow !== step.flowName) {
        lastFlow = step.flowName;
        return `await flow.${toCamelCase(step.flowName)}();`;
      }
      return null;
    }
    if (!step.pageName) return `// ${step.stepName}() { /* Page or page name is undefined */ }`;
    return `await flow.${toCamelCase(step.pageName)}Action.${toCamelCase(step.stepName)}(); // Action: ${step.pageName}`;
  }).filter(Boolean).join('\n    ');
  const addedTestCaseContent = `test('${testScenario.testCase}', async ({ page }) => {\n    ${testBody}\n  });`;

  if (existingTestFileContent.includes(`${testScenario.testCase}`)) {
    logWarn(`Test case '${testScenario.testCase}' already exists in ${testFilePath}, skipping addition.`);
    return;
  }
  const describeMatch = existingTestFileContent.match(/test.describe\(['"]([^'"]*)['"]\s*,\s*\(\)\s*=>\s*\{/);
  if (describeMatch) {
    // Find the end of the last test block (after its closing });)
    const testBlockRegex = /test\s*\(\s*['"][^'"]+['"],\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{[\s\S]*?\}\);/g;
    let match;
    let lastTestEnd = -1;
    while ((match = testBlockRegex.exec(existingTestFileContent)) !== null) {
      lastTestEnd = match.index + match[0].length;
    }
    const describeEndIndex = lastTestEnd !== -1 ? lastTestEnd : existingTestFileContent.lastIndexOf('});');
    const updatedContent = existingTestFileContent.slice(0, describeEndIndex) + `\n\n  ${addedTestCaseContent}` + existingTestFileContent.slice(describeEndIndex);
    safeWriteFile(testFilePath, updatedContent);
    logInfo(`Test case '${testScenario.testCase}' added successfully.`);
  } else {
    logError('No describe block found in the test file. Cannot append test case.');
  }
};
