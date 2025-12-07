import { isNullish, isNumber } from "./types.utils";

// Example: toFixed(3.14159, 3) // 3.142
export const toFixed = (value?: number | null, decimals = 0): number => {
  if (isNullish(value)) return 0;
  if (decimals < 0) throw new Error("[toFixed] decimals must be >= 0");
  if (decimals === 0) return Math.round(value);

  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

export const roundUpToNearest10 = (value?: number | null): number => {
  if (isNullish(value)) return 0;
  return Math.ceil(value / 10) * 10;
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
}
