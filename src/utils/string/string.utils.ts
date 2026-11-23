import { REGEX_ALPHANUMERIC } from './regex.utils';
import { isNullish } from '../runtime/types.utils';

export const isBlank = (str?: string | null): str is null | undefined | '' => {
  // eslint-disable-next-line coding-guide/prefer-blank-helpers -- isBlank is the helper itself, it cannot call itself
  return isNullish(str) || str?.trim() === '';
};

export const isNotBlank = (str?: string | null): str is string => {
  return !isBlank(str);
};

export const isAlphanumeric = (value: string): boolean => {
  return REGEX_ALPHANUMERIC.test(value);
};

/** habit-hooks-disable non-essential-comment
 * Strips combining marks after NFD decomposition: `"Ça va très bien"` → `"Ca va tres bien"`.
 */
export const removeDiacriticalMarks = (value: string): string => {
  if (isNullish(value)) {
    return '';
  }

  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
};

export const capitalizeFirst = (str: string): string => {
  if (isNullish(str)) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const countWords = (text: string): number => {
  if (isBlank(text)) return 0;
  return text.split(/\s+/).filter((word) => word.length > 0).length;
};

/** habit-hooks-disable non-essential-comment
 * The ellipsis counts toward `maxLength`: the result is never longer than `maxLength`.
 */
export const truncate = (str: string, maxLength: number, ellipsis = '...'): string => {
  if (isNullish(str) || str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/** habit-hooks-disable non-essential-comment
 * Handles camelCase, PascalCase, snake_case and spaces:
 * `"myComponentName"` → `"my-component-name"`, `"XMLParser"` → `"xml-parser"`.
 */
export const toKebabCase = (value?: string | null): string => {
  if (isBlank(value)) return '';
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
};

/** habit-hooks-disable non-essential-comment
 * Handles kebab-case, snake_case, PascalCase and spaces:
 * `"my-component-name"` → `"myComponentName"`, `"my_snake_case"` → `"mySnakeCase"`.
 */
export const toCamelCase = (value?: string | null): string => {
  if (isBlank(value)) return '';
  return value
    .trim()
    .replace(/[-_\s]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
};

/** habit-hooks-disable non-essential-comment
 * Diacritics removed, lowercased, non-alphanumeric runs collapsed to `-`, edge hyphens stripped:
 * `"Héllo Wörld!"` → `"hello-world"`.
 */
export const slugify = (value: string): string => {
  if (isBlank(value)) return '';
  return removeDiacriticalMarks(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const parseCommaSeparatedList = (raw?: string | null): string[] => {
  if (isBlank(raw)) {
    return [];
  }

  return raw
    .split(',')
    .map((s: string) => s.trim())
    .filter(isNotBlank);
};
