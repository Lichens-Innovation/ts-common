/**
 * ESLint flat config — TypeScript + TODO ticket reference (company default).
 * Same stack as rjsf-toolbox, without React/Testing Library.
 */

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import todoTicketRef from "./eslint-rules/todo-ticket-ref.js";

const baseConfig = tseslint.config(
  globalIgnores(["dist", "**/*.gen.ts"]),
  js.configs.recommended,
  {
    files: ["eslint.config.js", "prettier.config.js", "scripts/**"],
    languageOptions: {
      globals: {
        ...globals.node,
        console: "readonly",
        process: "readonly",
        module: "readonly",
      },
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.node,
    },
    rules: {
      "prefer-const": "error",
      "no-console": "warn",
      eqeqeq: ["error", "always"],
      "no-nested-ternary": "error",
      "no-empty": ["error", { allowEmptyCatch: false }],
      "no-useless-catch": "error",
      "max-depth": ["warn", 4],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
    },
  }
);

export default [
  ...baseConfig,
  {
    files: ["**/*.{ts,js}"],
    plugins: { "todo-plz": todoTicketRef },
    rules: {
      "todo-plz/ticket-ref": [
        "warn",
        {
          pattern: "([A-Z]+(?:-[A-Z0-9]+)*-\\d+)",
          comment:
            "TODO must include a ticket reference (e.g. TODO: JIRA-1234 - description)",
        },
      ],
    },
  },
  { files: ["eslint-rules/**"], rules: { "todo-plz/ticket-ref": "off" } },
  { files: ["eslint.config.js"], rules: { "todo-plz/ticket-ref": "off" } },
];
