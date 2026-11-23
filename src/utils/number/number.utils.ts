import { isBlank } from '../string/string.utils';
import { isNullish, isNumber } from '../runtime/types.utils';

export const isInputValidNumber = (value: string): boolean => {
  if (isBlank(value)) return false;
  const num = Number(value.trim());
  return Number.isFinite(num);
};

export const isInputValidInteger = (value: string): boolean => {
  if (!isInputValidNumber(value)) return false;
  const num = Number(value.trim());
  return Number.isInteger(num);
};

export const isInputValidPositiveInteger = (value: string): boolean => {
  if (!isInputValidInteger(value)) return false;
  const num = Number(value.trim());
  return num > 0;
};

export const isInputValidNegativeInteger = (value: string): boolean => {
  if (!isInputValidInteger(value)) return false;
  const num = Number(value.trim());
  return num < 0;
};

export const formatIntegerDisplay = (value?: number | null): string => String(toFixed(value, 0));

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

/** habit-hooks-disable non-essential-comment
 * One decimal with a K/M suffix: `1500` → `1.5K`, `2000000` → `2.0M`; below 1000 unchanged.
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

/** habit-hooks-disable non-essential-comment
 * `500` → `500ms`, `1500` → `1.5s`.
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
