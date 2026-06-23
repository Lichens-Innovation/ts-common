import { REGEX_ALPHANUMERIC } from './regex';
import { isNullish } from './types.utils';

export const isBlank = (str?: string | null): str is null | undefined | '' => {
  return isNullish(str) || str?.trim() === '';
};

export const isNotBlank = (str?: string | null): str is string => {
  return !isBlank(str);
};

export const isAlphanumeric = (value: string): boolean => {
  return REGEX_ALPHANUMERIC.test(value);
};

/**
 * Removes diacritical marks (e.g., accents, umlauts) from a string.
 * This method normalizes the input string to its canonical decomposition
 * form (NFD) and removes any combining diacritical marks.
 *
 * @param {string} value - The input string to normalize.
 * @returns {string} - The normalized string with diacritical marks removed.
 *
 * @example
 * const result = removeDiacriticalMarks("Ça va très bien, n'est-ce pas?");
 * console.log(result); // "Ca va tres bien, n'est-ce pas?"
 */
export const removeDiacriticalMarks = (value: string): string => {
  if (!value) {
    return '';
  }

  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Capitalize the first letter of a string.
 * @param str - The input string
 * @returns The string with the first character uppercased
 */
export const capitalizeFirst = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Count the number of words in a text string.
 * Words are separated by whitespace.
 * @param text - The text to count words in
 * @returns The number of words found
 */
export const countWords = (text: string): number => {
  if (!text || text.trim().length === 0) return 0;
  return text.split(/\s+/).filter((word) => word.length > 0).length;
};

/**
 * Truncate a string to a maximum length, adding an ellipsis if truncated.
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @param ellipsis - The ellipsis string to append (default: "...")
 * @returns The truncated string
 */
export const truncate = (str: string, maxLength: number, ellipsis = '...'): string => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Converts a string to kebab-case.
 * Handles camelCase, PascalCase, snake_case, and space-separated strings.
 *
 * @example
 * toKebabCase("myComponentName") // → "my-component-name"
 * toKebabCase("XMLParser")       // → "xml-parser"
 */
export const toKebabCase = (value: string): string => {
  if (isBlank(value)) return '';
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
};

/**
 * Converts a string to camelCase.
 * Handles kebab-case, snake_case, PascalCase, and space-separated strings.
 *
 * @example
 * toCamelCase("my-component-name") // → "myComponentName"
 * toCamelCase("my_snake_case")     // → "mySnakeCase"
 */
export const toCamelCase = (value: string): string => {
  if (isBlank(value)) return '';
  return value
    .trim()
    .replace(/[-_\s]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
};

/**
 * Converts a string to a URL-safe slug.
 * Removes diacritical marks, lowercases, replaces non-alphanumeric characters with hyphens,
 * and strips leading/trailing hyphens.
 *
 * @param value - The input string to slugify
 * @returns The slugified string
 *
 * @example
 * slugify("Héllo Wörld!") // → "hello-world"
 * slugify("  My Blog Post  ") // → "my-blog-post"
 */
export const slugify = (value: string): string => {
  if (!value) return '';
  return removeDiacriticalMarks(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Parses an optional comma-separated string into a trimmed, non-blank string array.
 */
export const parseCommaSeparatedList = (raw?: string | null): string[] => {
  if (isBlank(raw)) {
    return [];
  }

  return raw
    .split(',')
    .map((s: string) => s.trim())
    .filter(isNotBlank);
};
