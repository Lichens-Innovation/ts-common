# ts-common

Reusable generic typescript utilities, types, constants, helpers

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
  - [Contributions](#contributions)
  - [Unit tests](#unit-tests)
  - [Library semantic versioning](#library-semantic-versioning)
  - [Project coding guidelines](#project-coding-guidelines)

## Prerequisites

- Node.js (LTS or higher)
- Yarn

## Scripts

| Command                      | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| `yarn build`                 | Cleans the dist folder and compiles TypeScript                              |
| `yarn clean:node`            | Removes node_modules directories and yarn.lock file                         |
| `yarn clean:dist`            | Removes the dist directory                                                  |
| `yarn typecheck`             | Checks TypeScript types without emitting files                              |
| `yarn test`                  | Runs tests using Vitest                                                     |
| `yarn test:coverage`         | Runs tests with coverage report using Vitest                                |
| `yarn test:watch`            | Runs tests in watch mode using Vitest                                       |

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
