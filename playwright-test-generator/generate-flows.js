import fs from 'fs';
import path from 'path';
import { toCamelCase, toPascalCase, toKebabCase, logInfo, logError, safeReadFile, safeWriteFile } from './utils.js';

/**
 * Generates flow files for a feature based on provided test case flows.
 * @param {string} featureDir - The directory where the feature's files are stored.
 * @param {Array} allTestCaseFlows - An array of all test case flows for the feature.
 * @param {string} featureName - The name of the feature.
 * @returns {void}
 */
export const generateFlows = (featureDir, allTestCaseFlows, featureName) => {

    if (!featureDir || typeof featureDir !== 'string') {
        logError('Invalid or missing featureDir in generateFlows:', featureDir);
        return;
    }
    if (!Array.isArray(allTestCaseFlows) || allTestCaseFlows.length === 0) {
        logError('Invalid or missing allTestCaseFlows in generateFlows:', allTestCaseFlows);
        return;
    }
    if (!featureName || typeof featureName !== 'string') {
        logError('Invalid or missing featureName in generateFlows:', featureName);
        return;
    }

    const flowFilePath = path.join(featureDir, `${toKebabCase(featureName)}.flow.ts`);
    let existingFlowFileContent = '';
    let existingFlowFunctions = '';

    if (fs.existsSync(flowFilePath)) {
        existingFlowFileContent = safeReadFile(flowFilePath) || '';
        const classMatch = existingFlowFileContent.match(/export class \w+ \{([\s\S]*?)\}$/);
        if (classMatch) {
            const classBody = classMatch[1];
            const firstAsyncIdx = classBody.indexOf('async');
            const lastBraceIdx = classBody.lastIndexOf('}');
            if (firstAsyncIdx !== -1 && lastBraceIdx !== -1 && lastBraceIdx > firstAsyncIdx) {
                existingFlowFunctions = classBody.substring(firstAsyncIdx, lastBraceIdx + 1).trim();
            }
        }
    } else {
        logInfo(`Flow file does not exist: ${flowFilePath}, a new flow file will be created.`);
        const allFlows = allTestCaseFlows.flat();
        const uniquePages = [...new Set(allFlows.flatMap(flow => flow.steps.map(step => step.page)).filter(Boolean))];
        const imports = uniquePages.map(pageName =>
            `import { ${toPascalCase(pageName)}Action } from './actions/${toKebabCase(pageName)}.action';`
        ).join('\n');
        const propertyDeclarations = uniquePages.map(pageName =>
            `readonly ${toCamelCase(pageName)}Action: ${toPascalCase(pageName)}Action;`
        ).join('\n  ');
        const constructorParams = uniquePages.map(pageName =>
            `this.${toCamelCase(pageName)}Action = new ${toPascalCase(pageName)}Action(this.page);`
        ).join('\n    ');
        const newFlowFunctions = allFlows
            .filter(flow => flow.name !== '__NO_FLOW__')
            .map(flow => {
                const flowName = toCamelCase(flow.name);
                const steps = flow.steps.map(step => {
                    if (!step.page) return `    // ${step.name}(); { /* Page or page name is undefined */ }`;
                    return `    await this.${toCamelCase(step.page)}Action.${toCamelCase(step.name)}(); // Action: ${step.page}`;
                }).join('\n');
                return `  async ${flowName}() {\n${steps}\n  }`;
            })
            .join('\n\n');
        const flowObjectName = `${toPascalCase(featureName)}Flow`;
        const flowObject = `import { Page } from '@playwright/test';
${imports}

export class ${flowObjectName} {
  readonly page: Page;
  ${propertyDeclarations}

  constructor(page: Page) {
    this.page = page;
    ${constructorParams}
  }

${newFlowFunctions}
}`;
        safeWriteFile(flowFilePath, flowObject);
        logInfo(`Flow file created: ${flowFilePath}`);
        return;
    }

        const allFlows = allTestCaseFlows.flat();
        const uniquePages = [...new Set(allFlows.flatMap(flow => flow.steps.map(step => step.page)).filter(Boolean))];
        const existingImports = existingFlowFileContent.match(/import \{ .*?Action \} from '.*?';/g) || [];
        const existingPageNames = existingImports.map(importLine => {
            const match = importLine.match(/import \{ (.*?)Action \}/);
            return match ? match[1] : null;
        }).filter(Boolean);
        const newImports = uniquePages
            .filter(pageName => !existingPageNames.includes(toPascalCase(pageName)))
            .map(pageName =>
                `import { ${toPascalCase(pageName)}Action } from './actions/${toKebabCase(pageName)}.action';`
            )
            .join('\n');
        const updatedImports = existingImports.join('\n') + (newImports ? '\n' + newImports : '');
        const existingPropertyDeclarations = existingFlowFileContent.match(/readonly \w+Action: \w+Action;/g)
            ? existingFlowFileContent.match(/readonly \w+Action: \w+Action;/g).join('\n  ')
            : '';
        const newPropertyDeclarations = uniquePages
            .filter(pageName => !existingPageNames.includes(toPascalCase(pageName)))
            .map(pageName =>
                `readonly ${toCamelCase(pageName)}Action: ${toPascalCase(pageName)}Action;`
            )
            .join('\n  ');
        const updatedPropertyDeclarations = existingPropertyDeclarations + (newPropertyDeclarations ? '\n  ' + newPropertyDeclarations : '');
        const existingConstructorParams = existingFlowFileContent.match(/constructor\((.*?)\)\s*\{([\s\S]*?)\}/);
        const newConstructorParams = uniquePages
            .filter(pageName => !existingPageNames.includes(toPascalCase(pageName)))
            .map(pageName =>
                `this.${toCamelCase(pageName)}Action = new ${toPascalCase(pageName)}Action(this.page);`
            )
            .join('\n    ');
        const updatedConstructorParams = existingConstructorParams
            ? existingConstructorParams[2].trim() + (newConstructorParams ? '\n    ' + newConstructorParams : '')
            : newConstructorParams;
        const newFlowFunctions = allFlows
            .filter(flow => flow.name !== '__NO_FLOW__')
            .filter(flow => {
                const flowName = toCamelCase(flow.name);
                return !existingFlowFileContent.includes(`${flowName}`);
            })
            .map(flow => {
                const flowName = toCamelCase(flow.name);
                const steps = flow.steps.map(step => {
                    if (!step.page) return `    // ${step.name}() { /* Page or page name is undefined */ }`;
                    return `    await this.${toCamelCase(step.page)}Action.${toCamelCase(step.name)}(); // Action: ${step.page}`;
                }).join('\n');
                return `  async ${flowName}() {\n${steps}\n  }`;
            })
            .join('\n\n');
        const updatedFlowFunctions = existingFlowFunctions
            ? `  ${existingFlowFunctions}\n\n${newFlowFunctions}`
            : newFlowFunctions;
        const flowObjectName = `${toPascalCase(featureName)}Flow`;
        const flowObject = `import { Page } from '@playwright/test';
${updatedImports}

export class ${flowObjectName} {
  readonly page: Page;
  ${updatedPropertyDeclarations}

  constructor(page: Page) {
    ${updatedConstructorParams}
  }

${updatedFlowFunctions}
}`;
        safeWriteFile(flowFilePath, flowObject);
        logInfo(`Flow file updated: ${flowFilePath}`);
};
