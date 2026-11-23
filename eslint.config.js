/**
 * ESLint flat config — TypeScript coding standards (Lichens coding-guide)
 */

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import { globalIgnores } from 'eslint/config';
import codingGuide, { configs as codingGuideConfigs } from '@lichens-innovation/eslint-plugin-coding-guide';

const testFiles = ['**/*.test.ts', '**/*.spec.ts'];

export default tseslint.config(
  globalIgnores(['dist', 'coverage', '**/*.gen.ts', '.husky']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Node: root config files
  {
    files: ['*.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      sonarjs,
      unicorn,
      'coding-guide': codingGuide,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        projectService: {
          allowDefaultProject: ['*.config.ts', 'vitest.setup.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node },
    },
    rules: {
      'no-duplicate-imports': 'error',
      'no-warning-comments': ['warn', { terms: ['fixme', 'xxx', 'hack'], location: 'anywhere' }],
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      'no-nested-ternary': 'error',
      'max-depth': ['error', 2],
      complexity: ['error', 15],
      'sonarjs/cognitive-complexity': ['error', 15],
      ...codingGuideConfigs.recommended.rules,
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'func-style': ['error', 'expression'],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash',
              message:
                "Use a named import from 'lodash-es' instead (tree-shakeable), e.g. import { groupBy } from 'lodash-es'.",
            },
          ],
        },
      ],
      'no-eval': 'error',
      'no-new-func': 'error',
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
    },
  },
  // rjsf ships React hooks (no JSX): hooks rules only there
  {
    files: ['src/rjsf/**/*.ts'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  // one test file per subject: describe blocks and it.each tables legitimately run long
  {
    files: ['*.config.ts', ...testFiles],
    rules: { 'max-lines': 'off', 'max-lines-per-function': 'off' },
  }
);
