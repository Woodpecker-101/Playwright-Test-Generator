
# Playwright Test Generator

## Overview

The Playwright Test Generator contains a set of Node.js scripts that automate the generation of Playwright end-to-end test files, actions, flows, pages, and supporting data from structured Markdown tables. This tool is designed to streamline the process of creating and maintaining Playwright test suites, making it easier for teams to scale and standardize their testing efforts.

## Features

- **Markdown-Driven**: Define your test cases, flows, actions, and pages in Markdown tables for easy editing and version control.
- **Automated Generation**: Scripts parse your Markdown and generate Playwright test files, actions, flows and pages automatically.
- **Customizable**: Easily extend or modify the generation logic to fit your project’s conventions.
- **Batch Processing**: Generate multiple test artifacts in one go.
- **Playwright Hooks**: Automatically add Playwright hooks (beforeAll, afterAll, etc.) to your test files.

## How to Install

1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Navigate to your project root and install dependencies:

   ```sh
   npm install
   ```

3. Save the tool package under your project root.

## Advantages of Using POM and Flow Design Pattern

- **Page Object Model (POM):**
  - Encapsulates page structure and selectors in one place, making Playwright tests more maintainable and readable.
  - Reduces duplication and simplifies updates when UI changes.

- **Flow Design Pattern:**
  - Organizes complex user interactions into reusable flows.
  - Promotes modularity and reusability, making test cases easier to compose and maintain.

## Test Table Columns Explained

Your Markdown table should include the following columns:

| Column         | Description                                                 | Optionality                                      |
|----------------|-------------------------------------------------------------|--------------------------------------------------|
| Feature Name   | The feature or module under test.                           | If empty, value will be copied from previous row |
| Scenario Name  | The scenario or test suite name.                            | If empty, value will be copied from previous row |
| Test Name      | The name of the test case.                                  | If empty, value will be copied from previous row |
| Flow Name      | The flows (sequences of actions) to execute in the test.    | Optional                                         |
| Step Name      | The individual steps or actions for the test.               | Required                                         |
| Page Name      | The page objects involved in the test.                      | Optional                                         |
| Target         | The UI elements or targets interacted with during the test. | Optional                                         |

## Defining the Base Path (Three Options)

The base path determines where generated files are placed. You can define it in three ways:

1. **Command Line Argument**
   - Pass the base path as an argument when running the generator:

     ```sh
     node ./playwright-test-generator/generate-test-files.js myTable.md ./your-base-path
     ```
2. **Config File**
   - Set the base path in `./playwright-test-generator/config.js`.

3. **Prompt/Input**
   - If not provided, the script will use `./` as default.

## Quick Start

1. **Prepare Your Markdown Table**
   - Create a Markdown file (e.g., `myTable.md`) describing your test cases, flows, actions, and pages using tables.

2. **Run the Generator**
   - In your terminal, navigate to your project root and run:

     ```sh
     node ./playwright-test-generator/generate-test-files.js myTable.md
     ```

   - Optionally, specify the base path as described above.

3. **Generated Output**
   - The generated files will appear in the path you defined, ready for use.

## Example

Suppose you have a Markdown table like the one in `./myTableExample.md`:

Running the generator will create all the necessary test files in a folder named by the feature name.
Find the generated files example in the folder `./order-management`.

---

## Script Overview

The following scripts are included in this folder:

- `generate-test-files.js`: Main entry point. Orchestrates the generation of all Playwright test artifacts from Markdown tables.
- `generate-test-cases.js`: Creates or updates Playwright test case files for each scenario.
- `generate-actions.js`: Generates action classes for each page, mapping steps to UI actions.
- `generate-flows.js`: Generates flow classes for each feature, organizing sequences of actions.
- `generate-pages.js`: Generates page object files with selectors for each page.
- `add-hooks.js`: Adds Playwright hooks (beforeAll, afterAll, etc.) to test files.
- `markdown-parser.js`: Parses Markdown tables into structured data.
- `process-stdin.js`: Handles stdin input and parsing for batch processing.
- `config.js`: Sets the default base path for generated files.
- `utils.js`: Utility functions for case conversion, file I/O, and logging.
