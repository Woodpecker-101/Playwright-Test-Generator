import path from 'path';
import { logInfo, logWarn, logError, safeReadFile } from './utils.js';

/**
 * Parses a Markdown table string into an array of row objects.
 * @param {string} markdownInput - The Markdown table as a string.
 * @returns {Array} Array of parsed row objects.
 * @throws {Error} If the input is missing or invalid.
 */
export const parseMarkdownTable = (markdownInput) => {
  if (!markdownInput) {
    throw new Error('Markdown input is missing.');
  }

  const rows = markdownInput.split('\n').filter(row => row.trim() !== '');

  if (rows.length < 2) {
    throw new Error('Markdown table must have at least a header row and one data row.');
  }

  const headers = rows[0]
    .split('|')
    .map(header => header.trim())
    .filter(header => header !== '');

  const dataRows = rows.slice(1).filter(row => {
    const trimmedRow = row.replace(/^\||\|$/g, '').trim();
    return !/^[-\s|]+$/.test(trimmedRow);
  });

  const parsedRows = [];

  let lastFeature = '';
  let lastScenario = '';
  let lastTest = '';

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    let cells = row
      .split('|')
      .map(cell => cell.trim());

    if (cells[0] === '') cells.shift();
    if (cells[cells.length - 1] === '') cells.pop();

    if (cells.length < headers.length) {
      cells = [...cells, ...Array(headers.length - cells.length).fill('')];
    }

    const rowObject = {};
    headers.forEach((header, index) => {
      let value = cells[index] || '';

      if (header === 'Feature Name') {
        value = value || lastFeature;
        lastFeature = value;
      } else if (header === 'Scenario Name') {
        value = value || lastScenario;
        lastScenario = value;
      } else if (header === 'Test Name') {
        value = value || lastTest;
        lastTest = value;
      }
      // For 'Flow Name', do not propagate previous value if empty

      rowObject[header] = value;

      // Stop script execution for empty Step Name
      if (header === 'Step Name' && value === '') {
        throw new Error(`Error: Empty Step Name found in row ${i + 1}. Step Name cannot be empty. Please provide a valid Step Name.`);
      }
    });

    // Ensure 'Target' column is included
    if (!rowObject['Target']) {
      rowObject['Target'] = '';
    }
    parsedRows.push(rowObject);
  }
  return parsedRows;
};

/**
 * Reads and combines the contents of multiple Markdown files.
 * @param {Array<string>} filePaths - Array of file paths to read.
 * @returns {string} Combined content of all files.
 * @throws {Error} If any file cannot be read.
 */
export const readMarkdownFiles = (filePaths) => {
  return filePaths.map((filePath) => {
    try {
      const content = safeReadFile(path.resolve(filePath));
      logInfo(`Successfully read file: ${filePath}`);
      return content;
    } catch (error) {
      throw new Error(`Error reading file ${filePath}: ${error.message}`);
    }
  }).join('\n');
};

/**
 * Parses Markdown input for test scenarios, returning structured data.
 * @param {string} markdownInput - The Markdown content to parse.
 * @returns {Array|null} Parsed data or null if an error occurs.
 * @throws {Error} If the Markdown input is missing or invalid.
 */
export const parseMarkdownForTests = (markdownInput) => {
  try {
    let markdownToParse = markdownInput;
    if (!markdownToParse) {
      throw new Error('No Markdown content found in stdin input.');
    }
    // Use parseMarkdownTable to process the input
    const parsedData = parseMarkdownTable(markdownToParse);
    logInfo('Parsed Data:', JSON.stringify(parsedData, null, 2));
    return parsedData;
  } catch (error) {
    logError('Error generating test files:', `${error.message}`);
    return null;
  }
};