import fs from 'fs';
import path from 'path';
import { mapStepsToPages } from './generate-pages.js';
import { toCamelCase, toPascalCase, toKebabCase, logInfo, logWarn, logError, safeReadFile, safeWriteFile } from './utils.js';

/**
 * Generates action files for each page based on the provided steps.
 * @param {string} featureDir - The directory where the feature's files are stored.
 * @param {Array} steps - An array of step objects, each containing steps for a page.
 * @returns {void}
 */
export const generateActions = (featureDir, steps) => {
  if (!featureDir || typeof featureDir !== 'string') {
    logError('Invalid or missing featureDir in generateActions:', featureDir);
    return;
  }
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    logError('Invalid or missing steps in generateActions:', steps);
    return;
  }

  const pagesWithSteps = mapStepsToPages(steps);
  if (!pagesWithSteps || pagesWithSteps.length === 0) {
    logError('No pages provided for action generation.');
    return;
  }
  // Create the actions directory if it doesn't exist
  const actionsDir = path.join(featureDir, 'actions');
  fs.mkdirSync(actionsDir, { recursive: true });

  const stepTargetMap = steps.reduce((map, step) => {
    const stepName = step.name || 'Unnamed Step';
    const target = step.target || 'defaultSelector';
    if (!map[stepName]) {
      logInfo(`Mapping step: ${stepName} to target: ${target}`);
      map[stepName] = target;
    }
    return map;
  }, {});

  // Helper to extract existing action function names from the content of an action file
  const extractExistingActionNames = (content) => {
    const matches = content.match(/async (\w+)\s*\(/g) || [];
    return matches.map(line => {
      const match = line.match(/async (\w+)\s*\(/);
      return match ? match[1] : null;
    }).filter(Boolean);
  };

  pagesWithSteps.forEach(page => {
    logInfo(`Processing page: "${page.name}" with steps: ${JSON.stringify(page.steps)}`);
    if (!page.name || !page.steps) {
      logWarn(`Skipping action generation for page without a name or steps.`);
      return;
    }
    const actionFilePath = path.join(actionsDir, `${toKebabCase(page.name)}.action.ts`);
    let existingContent = '';
      if (fs.existsSync(actionFilePath)) {
        existingContent = safeReadFile(actionFilePath);
      }

      const uniqueSteps = [...new Set(page.steps)];
      const existingActionNames = extractExistingActionNames(existingContent);
      const newActions = uniqueSteps.filter(step => !existingActionNames.includes(toCamelCase(step)));

      if (newActions.length === 0) {
        logWarn(`No new actions to add for page: ${page.name}`);
        return;
      }

      // Extract existing actions body if present
      const existingActionsMatch = existingContent.match(/export class \w+ \{([\s\S]*)\}/);
      const existingActions = existingActionsMatch ? existingActionsMatch[1].trim() : '';

      const addedActions = newActions.map(step => {
        const target = stepTargetMap[step] || 'defaultSelector';
        return `  async ${toCamelCase(step)}() {\n    await ${toPascalCase(page.name)}Page.${toCamelCase(target)}(this.page).click();\n  }`;
      }).join('\n\n');

      // if the file exists, preserve the constructor and page property, otherwise add them
      let actionContent;
      if (!fs.existsSync(actionFilePath)) {
        actionContent = `import { Page } from '@playwright/test';\nimport { ${toPascalCase(page.name)}Page } from '../pages/${toKebabCase(page.name)}.page';\n\nexport class ${toPascalCase(page.name)}Action {\n  page: Page;\n  constructor(page: Page) {\n    this.page = page;\n  }\n\n${addedActions}\n}`;
      } else {
        // Try to preserve the page property and constructor if present
        const pagePropMatch = existingContent.match(/(\s*page:\s*Page;)/);
        const constructorMatch = existingContent.match(/(\s*constructor\([\s\S]*?\}\s*)/);
        const pageProp = pagePropMatch ? pagePropMatch[1] : '  page: Page;';
        const constructor = constructorMatch ? constructorMatch[1] : '  constructor(page: Page) {\n    this.page = page;\n  }';
        actionContent = `import { Page } from '@playwright/test';\nimport { ${toPascalCase(page.name)}Page } from '../pages/${toKebabCase(page.name)}.page';\n\nexport class ${toPascalCase(page.name)}Action {\n  ${existingActions ? existingActions + '\n\n' : ''}${addedActions}\n}`;      
      }

      safeWriteFile(actionFilePath, actionContent);
      logInfo(`Updated action file: ${actionFilePath}`);
  });
};
