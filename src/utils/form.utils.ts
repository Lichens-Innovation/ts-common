import { isBlank } from "./string.utils";
import { isNullish } from "./types.utils";

export const parseOptionalFormNumber = (value?: string | null): number | null => {
  if (isBlank(value)) return null;

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const toFormString = (n?: number | null): string => {
  if (isNullish(n)) return "";

  return Number.isFinite(n) ? String(n) : "";
};

/**
 * Converts a number to a form string, rounded to integer.
 * Avoids floating-point display noise (e.g. 3700.0000000000005).
 */
export const toFormStringInteger = (n?: number | null): string => {
  if (isNullish(n)) return "";
  if (!Number.isFinite(n)) return "";

  return String(Math.round(n));
};
