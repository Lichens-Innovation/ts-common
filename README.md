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
[![Bun](https://img.shields.io/badge/Bun-1.2+-FBF0DF.svg?style=flat-square&logo=bun)](https://bun.sh/)

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

- Node.js (>=24.18.0, see `.nvmrc`)
- Bun (>=1.2.0)

## Scripts

| Command                    | Description                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `bun run prepare`          | Configures Husky (Git hooks). Runs automatically after `bun install`.                           |
| `bun run build`            | Compiles the project with tsup (outputs to `dist/`).                                            |
| `bun run clean:node`       | Removes `node_modules` and `bun.lock`.                                                          |
| `bun run clean:dist`       | Removes the `dist` directory.                                                                   |
| `bun run typecheck`        | Type-checks sources and tests without emitting files (`tsc --noEmit`).                          |
| `bun run lint`             | Runs the coding-guide habit checks on the whole project (ESLint + knip + comments + jscpd).     |
| `bun run lint:ci`          | Runs ESLint only.                                                                               |
| `bun run lint:fix`         | Runs ESLint and applies automatic fixes.                                                        |
| `bun run lint:package`     | Lints `package.json` (exact dependency versions).                                               |
| `bun run lint:exports`     | Validates the published `exports`, types and files with publint (needs `bun run build` first).  |
| `bun run lint:unused`      | Detects unused files, dependencies and exports with knip.                                       |
| `bun run format`           | Formats all files with Prettier.                                                                |
| `bun run format:check`     | Checks Prettier formatting.                                                                     |
| `bun run habit:hooks`      | Runs the coding-guide checks on files changed since `main` (run it before opening a PR).        |
| `bun run habit:hooks:full` | Runs the coding-guide checks on the whole project.                                              |
| `bun run habit:snoozed`    | Lists snoozed keys (`.coding-guide/snooze.json`, kept empty).                                   |
| `bun run security:check`   | Audits deps for new CVEs vs `.cve-lite/baseline.json`, fails on high severity (`cve-lite-cli`). |
| `bun run test`             | Runs tests with Vitest.                                                                         |
| `bun run test:watch`       | Runs tests in watch mode with Vitest.                                                           |
| `bun run test:coverage`    | Runs tests with coverage report and the 80% threshold.                                          |

### Git hooks

| Hook         | Checks                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | typecheck, lint-staged (Prettier, `package.json` lint), `coding-guide check --staged`, `lint:package`, CVE scan when deps change |
| `pre-push`   | knip (`lint:unused`), tests with coverage threshold, blocks force pushes on `main`/`master`/`development`                        |
| `commit-msg` | commitlint (Conventional Commits)                                                                                                |

The same checks run in CI on every pull request (`.github/workflows/ci.yml`), plus a commitlint check of the PR title (squash merges use it as the release commit message).

## Optional modules

This library provides optional subpath modules with external dependencies. Install only the dependencies you need. For more information regarding the packaging, see the [following technical explanation](docs/packaging-approach.md).

### Excel (`@lichens-innovation/ts-common/excel`)

```bash
bun add exceljs mime
```

### CSV (`@lichens-innovation/ts-common/csv`)

```bash
bun add papaparse mime
```

### PDF (`@lichens-innovation/ts-common/pdf`)

```bash
bun add jspdf jspdf-autotable
```

### Web (`@lichens-innovation/ts-common/web`)

No external dependency required.

#### Saving files (native save picker with download fallback)

Uses the File System Access API (`showSaveFilePicker`) when available (Chromium browsers) and falls back to a classic download otherwise (Firefox, Safari, errors).

The picker requires a recent user activation, so for slow generations (PDF with charts, images, ...) request the file handle **at click start** and write **after** generation:

```ts
import { requestSaveFileHandle, saveBlob } from '@lichens-innovation/ts-common/web';

const onExportClick = async () => {
  const result = await requestSaveFileHandle({ suggestedName: 'report.pdf' });
  if (result.status === 'cancelled') return;
  const handle = result.status === 'picked' ? result.handle : null;

  const generator = await generateReport(); // slow work
  const { method, fileName } = await saveBlob({ blob: generator.toBlob(), fileName: generator.filename, handle });
};
```

When the blob is already available, use the one-shot helper (`null` when the user cancels):

```ts
import { saveBlobWithPicker } from '@lichens-innovation/ts-common/web';

const result = await saveBlobWithPicker({ blob, fileName: 'data.csv' });
```

Picker file types default to the MIME type derived from the file extension; pass `types` to override.

### MIME (`@lichens-innovation/ts-common/mime`)

```bash
bun add mime
```

### Logger (`@lichens-innovation/ts-common/logger`)

Logger based on [pino](https://getpino.io/) with formatted console output (timestamp, colored levels). Works in **browser** and **Node.js**.

- **Browser:** logs are formatted and sent to `console` with colored level labels.
- **Node.js:** logs are formatted with [pino-pretty](https://github.com/pinojs/pino-pretty) (colorized, readable output). Install `pino-pretty` when using the logger in Node.

**Install the dependencies:**

```bash
bun add pino
```

For **Node.js** (required for pretty output):

```bash
bun add pino-pretty
```

**Exports:** `logger`, `setLoggerMinimumLevel`, type `Level`.

**Usage example:**

```ts
import { logger, setLoggerMinimumLevel, type Level } from '@lichens-innovation/ts-common/logger';

// Minimum level (optional): "trace" | "debug" | "info" | "warn" | "error" | "fatal"
setLoggerMinimumLevel('debug');

logger.info('Simple message');
logger.debug('Debug', { userId: '123', action: 'login' });
logger.error('Error', { code: 500 });
```

### RJSF (`@lichens-innovation/ts-common/rjsf`)

Utilities and hooks for [React JSON Schema Form (RJSF)](https://rjsf-team.github.io/react-jsonschema-form/) with i18n (i18next / react-i18next), localized validation (ajv-i18n), and form layout. For React apps using RJSF with translation and validation.

**Install the dependencies:**

```bash
bun add @rjsf/core @rjsf/utils @rjsf/validator-ajv8 ajv-i18n i18next react-i18next
```

## Contributions

Contributions to the project are made by simply improving the current codebase and then creating a Pull Request. When the PR is merged into `main`, the CI pipeline runs automatically. [semantic-release](https://semantic-release.gitbook.io/) determines the next version from conventional commit messages, updates `CHANGELOG.md` and `package.json`, and publishes the new version to the GitHub Packages registry — no manual version bump required.

## Unit tests

Test coverage must be maintained at 80% or higher. It is therefore important to always attempt to cover new code that is added with appropriate tests.

## Library semantic versioning

Versioning is automated by [semantic-release](https://semantic-release.gitbook.io/) using [Conventional Commits](https://www.conventionalcommits.org/). The release type is derived from commit message prefixes:

| Commit prefix                 | Release type                                    |
| ----------------------------- | ----------------------------------------------- |
| `fix:`                        | `PATCH` — backward-compatible bug fix           |
| `feat:`                       | `MINOR` — new backward-compatible functionality |
| `feat!:` / `BREAKING CHANGE:` | `MAJOR` — incompatible API change               |

Follow [Semantic Versioning](https://semver.org/#summary) (`MAJOR.MINOR.PATCH`) when writing commit messages — the tooling takes care of the rest.

## Project coding guidelines

The codebase follows the Lichens coding standard enforced by [`@lichens-innovation/eslint-plugin-coding-guide`](https://github.com/Lichens-Innovation/eslint-plugin-coding-guide): ESLint rules (`eslint.config.js`) plus the `coding-guide` CLI, which also reports unused code (knip), non-essential comments and duplicated code (jscpd), and prints a coaching guide for each smell.

- Every commit is checked on its staged files; run `bun run habit:hooks` before opening a PR.
- The snooze list (`.coding-guide/snooze.json`) is empty and should stay that way: fix the finding, or justify a single exception in place with `// eslint-disable-next-line <rule> -- <reason>` or `habit-hooks-disable <smell>`.
- Inside `src`, import from the defining file, never from a `*.index.ts` barrel: barrels only define the published entry points.
- See the [adoption guide](https://github.com/Lichens-Innovation/eslint-plugin-coding-guide/blob/main/docs/adoption-guide.md) and the [CLI documentation](https://github.com/Lichens-Innovation/eslint-plugin-coding-guide/blob/main/docs/cli.md).

## TODOs

This section list remaining tasks (not yet completed)

- RJSF-001: find a way to dynamically resolve the rjsf-i18n.utils "%1 Key" pattern

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
