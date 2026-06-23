import { isBlank } from './string.utils';
import { isNullish, isNumber } from './types.utils';

/**
 * Returns true if the input string is a valid number (blank and non-numeric strings are invalid).
 */
export const isInputValidNumber = (value: string): boolean => {
  if (isBlank(value)) return false;
  const num = Number(value.trim());
  return Number.isFinite(num);
};

/**
 * Returns true if the input string is a valid integer (decimals like "1500.5" are invalid).
 */
export const isInputValidInteger = (value: string): boolean => {
  if (!isInputValidNumber(value)) return false;
  const num = Number(value.trim());
  return Number.isInteger(num);
};

/**
 * Returns true if the input string is a valid positive integer (decimals like "1500.5" are invalid).
 */
export const isInputValidPositiveInteger = (value: string): boolean => {
  if (!isInputValidInteger(value)) return false;
  const num = Number(value.trim());
  return num > 0;
};

/**
 * Returns true if the input string is a valid negative integer (decimals like "1500.5" are invalid).
 */
export const isInputValidNegativeInteger = (value: string): boolean => {
  if (!isInputValidInteger(value)) return false;
  const num = Number(value.trim());
  return num < 0;
};

/**
 * Formats a number as an integer display string (removes decimals).
 */
export const formatIntegerDisplay = (value?: number | null): string => String(toFixed(value, 0));

// Example: toFixed(3.14159, 3) // 3.142
export const toFixed = (value?: number | null, decimals = 0): number => {
  if (isNullish(value)) return 0;
  if (decimals < 0) throw new Error('[toFixed] decimals must be >= 0');
  if (decimals === 0) return Math.round(value);

  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

export const roundUpToNearest10 = (value?: number | null): number => {
  if (isNullish(value)) return 0;
  return Math.ceil(value / 10) * 10;
};

/**
 * Format a number with K (thousands) or M (millions) suffix.
 */
export const formatCount = (count: number): string => {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * Format a duration in milliseconds to a human-readable string.
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
};

export const formatWithSpaceSeparator = (val?: number | string | null): string => {
  if (isNullish(val)) return '';
  return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
};

export const parseWithSpaceSeparator = (val?: string): number => {
  return Number(val?.replace(/\u00a0/g, ''));
};

export const getOrderOfMagnitudeExponent = (n?: number | null): number => {
  if (isNullish(n)) return 0;
  if (!isNumber(n)) return 0;

  const absValue = Math.abs(n);
  if (absValue === 0) {
    return 0;
  }

  const integerPart = Math.floor(absValue);
  return Math.floor(Math.log10(integerPart));
};
