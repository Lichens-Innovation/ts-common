# ts-common

Reusable generic typescript utilities, types, constants, helpers

> **Note:** The default export is **pure TypeScript** and **environment-agnostic**—it has no dependency on Node.js, browser, or React Native APIs, so the same code runs in any of these runtimes. Subpath imports such as `@lichens-innovation/ts-common/web` target a specific environment and rely on its APIs.

<!-- Package & Status -->
[![npm version](https://img.shields.io/npm/v/@lichens-innovation/ts-common.svg?style=flat-square)](https://www.npmjs.com/package/@lichens-innovation/ts-common)
[![npm downloads](https://img.shields.io/npm/dm/@lichens-innovation/ts-common.svg?style=flat-square)](https://www.npmjs.com/package/@lichens-innovation/ts-common)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Lichens-Innovation/ts-common/create-release.yml?branch=main&style=flat-square&logo=github)](https://github.com/Lichens-Innovation/ts-common/actions)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<!-- Tech Stack -->
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Yarn](https://img.shields.io/badge/Yarn-1.22+-2C8EBB.svg?style=flat-square&logo=yarn)](https://yarnpkg.com/)

<!-- Code Quality -->
[![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18.svg?style=flat-square&logo=vitest)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-9.x-4B32C3.svg?style=flat-square&logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square&logo=prettier)](https://prettier.io/)

<!-- Standards -->
[![Semantic Versioning](https://img.shields.io/badge/semver-2.0.0-blue.svg?style=flat-square)](https://semver.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

Table of content
- [ts-common](#ts-common)
  - [Prerequisites](#prerequisites)
  - [Scripts](#scripts)
  - [Optional modules](#optional-modules)
    - [Excel (`@lichens-innovation/ts-common/excel`)](#excel-lichens-innovationts-commonexcel)
    - [CSV (`@lichens-innovation/ts-common/csv`)](#csv-lichens-innovationts-commoncsv)
    - [PDF (`@lichens-innovation/ts-common/pdf`)](#pdf-lichens-innovationts-commonpdf)
    - [Web (`@lichens-innovation/ts-common/web`)](#web-lichens-innovationts-commonweb)
    - [MIME (`@lichens-innovation/ts-common/mime`)](#mime-lichens-innovationts-commonmime)
    - [Logger (`@lichens-innovation/ts-common/logger`)](#logger-lichens-innovationts-commonlogger)
    - [RJSF (`@lichens-innovation/ts-common/rjsf`)](#rjsf-lichens-innovationts-commonrjsf)
  - [Contributions](#contributions)
  - [Unit tests](#unit-tests)
  - [Library semantic versioning](#library-semantic-versioning)
  - [Project coding guidelines](#project-coding-guidelines)
  - [TODOs](#todos)
  - [License](#license)

## Prerequisites

- Node.js (LTS or higher)
- Yarn

## Scripts

| Command                      | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| `yarn prepare`               | Configures Husky (Git hooks). Runs automatically after `yarn install`.      |
| `yarn build`                 | Compiles the project with tsup (outputs to `dist/`).                        |
| `yarn clean:node`            | Removes `node_modules` and `yarn.lock`.                                     |
| `yarn clean:dist`            | Removes the `dist` directory.                                               |
| `yarn typecheck`             | Type-checks TypeScript without emitting files (`tsc --noEmit`).             |
| `yarn lint`                  | Runs ESLint on the project.                                                 |
| `yarn lint:fix`              | Runs ESLint and applies automatic fixes.                                    |
| `yarn test`                  | Runs tests with Vitest and coverage report.                                 |
| `yarn test:watch`            | Runs tests in watch mode with Vitest.                                       |
| `yarn test:coverage`         | Runs tests with coverage report using Vitest.                               |

## Optional modules

This library provides optional subpath modules with external dependencies. Install only the dependencies you need. For more information regarding the packaging, see the [following technical explanation](docs/packaging-approach.md).

### Excel (`@lichens-innovation/ts-common/excel`)

```bash
npm install exceljs mime
```

### CSV (`@lichens-innovation/ts-common/csv`)

```bash
npm install papaparse mime
```

### PDF (`@lichens-innovation/ts-common/pdf`)

```bash
npm install jspdf jspdf-autotable
```

### Web (`@lichens-innovation/ts-common/web`)

No external dependency required.

### MIME (`@lichens-innovation/ts-common/mime`)

```bash
npm install mime
```

### Logger (`@lichens-innovation/ts-common/logger`)

Logger based on [pino](https://getpino.io/) with formatted console output (timestamp, colored levels). Works in **browser** and **Node.js**.

- **Browser:** logs are formatted and sent to `console` with colored level labels.
- **Node.js:** logs are formatted with [pino-pretty](https://github.com/pinojs/pino-pretty) (colorized, readable output). Install `pino-pretty` when using the logger in Node.

**Install the dependencies:**

```bash
npm install pino
```

For **Node.js** (required for pretty output):

```bash
npm install pino-pretty
```

**Exports:** `logger`, `setLoggerMinimumLevel`, type `Level`.

**Usage example:**

```ts
import { logger, setLoggerMinimumLevel, type Level } from "@lichens-innovation/ts-common/logger";

// Minimum level (optional): "trace" | "debug" | "info" | "warn" | "error" | "fatal"
setLoggerMinimumLevel("debug");

logger.info("Simple message");
logger.debug("Debug", { userId: "123", action: "login" });
logger.error("Error", { code: 500 });
```

### RJSF (`@lichens-innovation/ts-common/rjsf`)

Utilities and hooks for [React JSON Schema Form (RJSF)](https://rjsf-team.github.io/react-jsonschema-form/) with i18n (i18next / react-i18next), localized validation (ajv-i18n), and form layout. For React apps using RJSF with translation and validation.

**Install the dependencies:**

```bash
npm install @rjsf/utils @rjsf/validator-ajv8 ajv-i18n i18next react-i18next
```

**Exports:** `initRjsf`, `useLocalizedForm`, `useRjsfValidator`, `useFormLayoutCols`, `translateRjsfString`, `RJSF_STRING_TO_I18N_KEY`, types (`LocalizedFormSchema`, `MetaFormSchema`, etc.).

**Usage example:**

```ts
import { initRjsf, useLocalizedForm, useRjsfValidator } from "@lichens-innovation/ts-common/rjsf";

// After i18next is initialized (e.g. initI18N())
initRjsf();

// In a form component: localized schema from meta schema
const localizedSchema = useLocalizedForm(metaFormSchema);

// Validator with localized AJV messages (e.g. fr, en)
const validator = useRjsfValidator();
```

## Contributions

Contributions to the project are made by simply improving the current codebase and then creating a Pull Request. If the version field in `package.json` is incremented, the build will be automatically triggered when the PR is merged into the `main` branch, and the new version will be published to our enterprise Git repository.

## Unit tests

Test coverage must be maintained at 80% or higher. It is therefore important to always attempt to cover new code that is added with appropriate tests.

## Library semantic versioning

When there is a breaking change, [Semantic Versioning](https://semver.org/#summary) must be used to indicate that a major behavior has changed. Semantic Versioning follows the `MAJOR.MINOR.PATCH` format:

* `MAJOR` version when you make incompatible API changes
* `MINOR` version when you add functionality in a backward compatible manner
* `PATCH` version when you make backward compatible bug fixes

## Project coding guidelines

Adhering to established coding guidelines is essential for developing efficient, maintainable, and scalable software. These guidelines promote consistency across codebases, making it easier for teams to collaborate and for new developers to understand existing code. By following standardized patterns, such as those outlined in the [Coding guidelines](https://github.com/amwebexpert/chrome-extensions-collection/blob/master/packages/coding-guide-helper/public/markdowns/table-of-content.md), developers can reduce errors and enhance code readability.

* [Coding guidelines](https://github.com/amwebexpert/chrome-extensions-collection/blob/master/packages/coding-guide-helper/public/markdowns/table-of-content.md)

## TODOs

This section list remaining tasks (not yet completed)
* RJSF-001: find a way to dynamically resolve the rjsf-i18n.utils "%1 Key" pattern

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
