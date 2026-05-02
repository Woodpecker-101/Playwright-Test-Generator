import fs from 'fs';
import path from 'path';
import { mapStepsToPages } from './generate-pages.js';
import { toCamelCase, toPascalCase, toKebabCase, logInfo, logWarn, logError, safeReadFile, safeWriteFile } from './utils.js';
import { log } from 'console';

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

  pagesWithSteps.forEach(page => {
    logInfo(`Processing page: "${page.name}" with steps: ${JSON.stringify(page.steps)}`);
    if (!page.name || !page.steps) {
      logWarn(`Skipping action generation for page without a name or steps.`);
      return;
    }
    const actionFilePath = path.join(actionsDir, `${toKebabCase(page.name)}.action.ts`);

    let existingContent = '';

    if (!fs.existsSync(actionFilePath)) {
      // If the file doesn't exist
      const uniqueSteps = [...new Set(page.steps)];
      const newActions = uniqueSteps.filter(step => {
        const actionFunction = `${toCamelCase(step)}`;
        return !existingContent.includes(actionFunction);
      });

      if (newActions.length === 0) {
        logWarn(`No new actions to add for page: ${page.name}`);
        return;
      }

      const existingActionsMatch = existingContent.match(/export class \w+ \{([\s\S]*?)\}/);
      const existingActions = existingActionsMatch ? existingActionsMatch[1].trim() : '';

      // Filter newActions to only include steps that are not already in the action file
      const existingActionFunctions = existingContent.match(/async (\w+)\s*\(/g) || [];
      const existingActionNames = existingActionFunctions.map(actionLine => {
        const match = actionLine.match(/async (\w+)\s*\(/);
        return match ? match[1] : null;
      }).filter(Boolean);

      const filteredNewActions = newActions.filter(step => !existingActionNames.includes(toCamelCase(step)));

      const addedActions = filteredNewActions.map(step => {
        const target = stepTargetMap[step] || 'defaultSelector';

        return `  async ${toCamelCase(step)}() {
    await ${toPascalCase(page.name)}Page.${toCamelCase(target)}(this.page).click();
  }`;
      }).join('\n\n');
      const updatedActions = existingActions ? `${existingActions}\n\n${addedActions}` : addedActions;

      const actionContent = `import { Page } from '@playwright/test';
import { ${toPascalCase(page.name)}Page } from '../pages/${toKebabCase(page.name)}.page';

export class ${toPascalCase(page.name)}Action {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

${updatedActions}
}`;

      safeWriteFile(actionFilePath, actionContent);
      logInfo(`Updated action file: ${actionFilePath}`);
    } else {
      // If the file exists, read its content to check for existing actions
      existingContent = safeReadFile(actionFilePath);
      const uniqueSteps = [...new Set(page.steps)];
      const newActions = uniqueSteps.filter(step => {
        const actionFunction = `  async ${toCamelCase(step)}() {`;
        return !existingContent.includes(actionFunction);
      });

      if (newActions.length === 0) {
        logWarn(`No new actions to add for page: ${page.name}`);
        return;
      }

      const existingActionsMatch = existingContent.match(/export class \w+ \{([\s\S]*)\}/);
      const existingActions = existingActionsMatch ? existingActionsMatch[1].trim() : '';

      // Filter newActions to only include steps that are not already in the action file
      const existingActionFunctions = existingContent.match(/async (\w+)\s*\(/g) || [];
      const existingActionNames = existingActionFunctions.map(actionLine => {
        const match = actionLine.match(/async (\w+)\s*\(/);
        return match ? match[1] : null;
      }).filter(Boolean);

      const filteredNewActions = newActions.filter(step => !existingActionNames.includes(toCamelCase(step)));

      const addedActions = filteredNewActions.map(step => {
        const target = stepTargetMap[step] || 'defaultSelector';

        return `  async ${toCamelCase(step)}() {
    await ${toPascalCase(page.name)}Page.${toCamelCase(target)}(this.page).click();
  }`;
      }).join('\n\n');

      const updatedActions = existingActions ? `${existingActions}\n\n${addedActions}` : addedActions;
      const actionContent = `import { Page } from '@playwright/test';
import { ${toPascalCase(page.name)}Page } from '../pages/${toKebabCase(page.name)}.page';

export class ${toPascalCase(page.name)}Action {
  ${updatedActions}
}`;

      safeWriteFile(actionFilePath, actionContent);
      logInfo(`Updated action file: ${actionFilePath}`);
    }
  });
};