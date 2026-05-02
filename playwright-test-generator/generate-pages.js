import fs from 'fs';
import path from 'path';
import { toCamelCase, toPascalCase, toKebabCase, logInfo, logWarn, logError, safeWriteFile, safeReadFile } from './utils.js';

/**
 * Groups steps by page, collecting unique steps and targets for each page.
 * @param {Array} steps - Array of step objects: { page, name, target }
 * @returns {Array} Array of page objects: { name, steps, targets }
 */
export const mapStepsToPages = (steps) => {
  if (!Array.isArray(steps) || steps.length === 0) {
    logError('Invalid or missing steps in mapStepsToPages:', steps);
    return [];
  }

  const pagesWithSteps = steps.reduce((acc, step) => {
    const pageName = step.page;
    const target = step.target || 'defaultSelector';

    if (!acc[pageName]) {
      acc[pageName] = { name: pageName, steps: [], targets: [] };
    }
    if (!acc[pageName].steps.includes(step.name)) {
      acc[pageName].steps.push(step.name);
    }
    if (!acc[pageName].targets.includes(target)) {
      acc[pageName].targets.push(target);
    }
    return acc;
  }, {});

  logInfo(`Mapped steps to pages: ${JSON.stringify(pagesWithSteps, null, 2)}`);
  return Object.values(pagesWithSteps);
};

/**
 * Generates page files for each page based on the provided flows or pages.
 * @param {string} featureDir - The directory where the feature's files are stored.
 * @param {Array} steps - Array of step objects: { page, name, target }
 * @returns {void}
 */
export const generatePages = (featureDir, steps) => {

  if (!featureDir || typeof featureDir !== 'string') {
    logError('Invalid or missing featureDir in generatePages:', featureDir);
    return;
  }
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    logError('Invalid or missing steps in generatePages:', steps);
    return;
  }

  const pagesWithSteps = mapStepsToPages(steps);

  if (!pagesWithSteps || pagesWithSteps.length === 0) {
    logError('No pages provided for generation.');
    return;
  }

  const pagesDir = path.join(featureDir, 'pages');
  fs.mkdirSync(pagesDir, { recursive: true });

  // Ensure pages include selectors and align with the new action generation logic
  pagesWithSteps.forEach(page => {
    if (!page.name) {
      logWarn('Skipping page generation for unnamed page.');
      return; 
    }

    const pageFilePath = path.join(pagesDir, `${toKebabCase(page.name)}.page.ts`);
    let existingContent = '';

    if (!fs.existsSync(pageFilePath)) {
      // Generate selectors for all targets
      const selectors = page.targets.map(target => {
        const selectorName = toCamelCase(target);
        return `  static ${selectorName}(page: Page) {
    return page.locator('[data-testid="${target}"]');
  }`;
      }).join('\n');

      const pageContent = `import { Page } from '@playwright/test';

export class ${toPascalCase(page.name)}Page {
${selectors}
}`;
      safeWriteFile(pageFilePath, pageContent);
      logInfo(`Created page file: ${pageFilePath}`);
    } else {
      // If the file exists, update it with any new selectors if needed
      logInfo(`Page file already exists: ${pageFilePath}`);
      existingContent = safeReadFile(pageFilePath);
      const existingSelectorsMatch = existingContent.match(/export class \w+ \{([\s\S]*)\}/);
      const existingSelectors = existingSelectorsMatch ? existingSelectorsMatch[1].trim() : '';

      // Filter newActions to only include steps that are not already in the action file
      const existingPageSelectors = existingContent.match(/static (\w+)\s*\(/g) || [];
      const existingTargetNames = existingPageSelectors.map(selectorLine => {
        const match = selectorLine.match(/static (\w+)\s*\(/);
        return match ? match[1] : null;
      }).filter(Boolean);

      const newTargets = page.targets.filter(target => !existingTargetNames.includes(toCamelCase(target)));

      if (newTargets.length > 0) {
        const addedSelectors = newTargets.map(target => {
          const selectorName = toCamelCase(target);
          return `  static ${selectorName}(page: Page) {
    return page.locator('[data-testid="${target}"]');
  }`;
        }).join('\n');

        const updatedSelectors = existingSelectors ? `${existingSelectors}\n${addedSelectors}` : addedSelectors;

        logInfo(`Updated selectors for page "${page.name}": ${updatedSelectors}`);

        const pageContent = `import { Page } from '@playwright/test';

export class ${toPascalCase(page.name)}Page {
  ${updatedSelectors}
}`;
        safeWriteFile(pageFilePath, pageContent);
        logInfo(`Updated page file with new selectors: ${pageFilePath}`);
      }
    }
  });
};