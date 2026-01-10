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
export const truncate = (str: string, maxLength: number, ellipsis = "..."): string => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};
