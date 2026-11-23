import { isBlank } from '../string/string.utils';
import { isNullish } from './types.utils';

export const parseOptionalFormNumber = (value?: string | null): number | null => {
  if (isBlank(value)) return null;

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const toFormString = (n?: number | null): string => {
  if (isNullish(n)) return '';

  return Number.isFinite(n) ? String(n) : '';
};

/** habit-hooks-disable non-essential-comment
 * Rounds to avoid floating-point display noise such as `3700.0000000000005`.
 */
export const toFormStringInteger = (n?: number | null): string => {
  if (isNullish(n)) return '';
  if (!Number.isFinite(n)) return '';

  return String(Math.round(n));
};
