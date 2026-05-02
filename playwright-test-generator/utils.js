import fs from 'fs';

export const toCamelCase = (str) => str.replace(/(?:^|\s)([a-z])/g, (_, char) => char.toUpperCase()).replace(/\s+/g, '').replace(/^./, char => char.toLowerCase());
export const toPascalCase = (str) => str.replace(/(?:^|\s)([a-z])/g, (_, char) => char.toUpperCase()).replace(/\s+/g, '');
export const toKebabCase = (str) => str.replace(/\s+/g, '-').toLowerCase();

export const logInfo = (message) => console.log(`[INFO]: ${message}`);
export const logWarn = (message) => console.warn(`[WARN]: ${message}`);
export const logError = (message) => console.error(`[ERROR]: ${message}`);

/**
 * Reads a file safely, returning its content or null if an error occurs.
 * @param {string} filePath - The path to the file.
 * @returns {string|null}
 */
export const safeReadFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    logError(`Failed to read file: ${filePath}. Error: ${error.message}`);
    return null;
  }
};

/**
 * Writes content to a file safely, logging success or error.
 * @param {string} filePath - The path to the file.
 * @param {string} content - The content to write.
 * @returns {void}
 */
export const safeWriteFile = (filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    logInfo(`File written successfully: ${filePath}`);
  } catch (error) {
    logError(`Failed to write file: ${filePath}. Error: ${error.message}`);
  }
};

/**
 * Creates a hook block as a string.
 * @param {string} hookName - The name of the hook (e.g., 'beforeEach').
 * @param {string} content - The content inside the hook.
 * @returns {string}
 */
export const createHookBlock = (hookName, content) => `  test.${hookName}(async () => {
    ${content}
  });\n`;

/**
 * Inserts a hook into the test file content at the specified position.
 * @param {string} content - The file content.
 * @param {string} hook - The hook name.
 * @param {Object} position - The position object with regex and getIndex.
 * @returns {string} Updated file content.
 */
export const insertHook = (content, hook, position) => {
  if (!content.includes(`test.${hook}(async ()`)) {
    const match = content.match(position.regex);
    if (match) {
      const insertIndex = position.getIndex(content, match);
      return (
        content.slice(0, insertIndex) +
        '\n' +
        createHookBlock(hook, position.comment) +
        content.slice(insertIndex)
      );
    }
  }
  return content;
};