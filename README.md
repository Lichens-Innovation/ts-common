# ts-common
Reusable generic typescript utilities, types, constants, helpers

### Prerequisites

- Node.js (LTS or higher)
- Yarn

### Scripts

| Command                      | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| `yarn build`                 | Cleans the dist folder and compiles TypeScript                              |
| `yarn clean:node`            | Removes node_modules directories and yarn.lock file                         |
| `yarn clean:dist`            | Removes the dist directory                                                  |
| `yarn typecheck`             | Checks TypeScript types without emitting files                              |
| `yarn test`                  | Runs tests using Vitest                                                     |

## Contributions

Contributions to the project are made by simply improving the current codebase and then creating a Pull Request. If the version field in `package.json` is incremented, the build will be automatically triggered when the PR is merged into the `main` branch, and the new version will be published to our enterprise Git repository.

## Project coding guidelines

Adhering to established coding guidelines is essential for developing efficient, maintainable, and scalable software. These guidelines promote consistency across codebases, making it easier for teams to collaborate and for new developers to understand existing code. By following standardized patterns, such as those outlined in the [Coding guidelines](https://github.com/amwebexpert/chrome-extensions-collection/blob/master/packages/coding-guide-helper/public/markdowns/table-of-content.md), developers can reduce errors and enhance code readability.

* [Coding guidelines](https://github.com/amwebexpert/chrome-extensions-collection/blob/master/packages/coding-guide-helper/public/markdowns/table-of-content.md)
