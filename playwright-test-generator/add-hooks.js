import path from 'path';
import { toKebabCase, insertHook, logInfo, logError, safeReadFile, safeWriteFile } from './utils.js';

/**
 * Adds hooks (before, beforeEach, afterEach, after) to a test file for a given scenario.
 * @param {string} featureDir - The directory where the feature's files are stored.
 * @param {Object} scenario - The scenario object containing the feature name.
 * @returns {void}
 */
export const addHooks = (featureDir, scenario) => {
  const testFileDir = path.join(featureDir, 'tests');
  const testFilePath = path.join(testFileDir, `${toKebabCase(scenario.testScenario)}.test.ts`);

  const content = safeReadFile(testFilePath);
  if (!content) {
    logError(`Test file does not exist: ${testFilePath}, hooks will not be added.`);
    return;
  }

  logInfo(`Test file exists: ${testFilePath}, proceeding to add hooks.`);

  const positions = {
    beforeBeforeEach: {
      regex: /^\s*test\.beforeEach\s*\(/m,
      getIndex: (content, match) => {
        // Find the start of the line where test.beforeEach is located
        const beforeEachIdx = match.index;
        const lineStartIdx = content.lastIndexOf('\n', beforeEachIdx - 1) + 1;
        return lineStartIdx;
      },
      comment: '// Add any setup code here if needed',
    },
    after: {
      regex: /test.describe\(['"]([^'"]*)['"]\s*,\s*\(\)\s*=>\s*\{/,
      getIndex: (content) => content.lastIndexOf('});'),
      comment: '// Add any teardown code here if needed',
    },
  };

  let updatedContent = insertHook(content, 'beforeAll', positions.beforeBeforeEach);
  updatedContent = insertHook(updatedContent, 'afterEach', positions.after);
  updatedContent = insertHook(updatedContent, 'afterAll', positions.after);

  safeWriteFile(testFilePath, updatedContent);
};