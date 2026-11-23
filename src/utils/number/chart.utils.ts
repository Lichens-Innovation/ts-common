import { isNullish } from '../runtime/types.utils';

export interface ToleranceArea {
  flow: number;
  toleranceRange: [number, number];
}

export interface ChartPoint {
  x: number;
  y: number;
}

export interface NullableChartPoint {
  x?: number | null;
  y?: number | null;
}

export const getTickDomain = (ticks: number[]): [number, number] => [0, ticks.at(-1) ?? 0];

export const tickFormatter = (value: number): string => value.toFixed(0);

export const toToleranceLabel = (value: number): string => `±${(value * 100).toFixed(0)}%`;

export const tooltipValueFormatter = (data?: unknown | null): string => {
  if (isNullish(data)) {
    return '';
  }

  if (typeof data === 'number') {
    return data.toFixed(2);
  }

  if (Array.isArray(data) && data.length >= 2) {
    const [min, max] = data;
    if (typeof min === 'number' && typeof max === 'number') {
      return `[${min.toFixed(2)} … ${max.toFixed(2)}]`;
    }
  }

  return String(data ?? '');
};

/** habit-hooks-disable non-essential-comment
 * Rounds up to 1, 2, 2.5, 5 or 10 times a power of 10, for chart axis increments:
 * `0.7` → `1`, `3` → `5`, `17` → `20`, `80` → `100`.
 */
export const roundToNiceNumber = (rawValue: number): number => {
  if (rawValue <= 0) return 0;

  const magnitude = Math.pow(10, Math.floor(Math.log10(rawValue)));

  const normalized = rawValue / magnitude;

  let niceMultiplier: number;
  if (normalized <= 1) niceMultiplier = 1;
  else if (normalized <= 2) niceMultiplier = 2;
  else if (normalized <= 2.5) niceMultiplier = 2.5;
  else if (normalized <= 5) niceMultiplier = 5;
  else niceMultiplier = 10;

  return niceMultiplier * magnitude;
};

const roundToPrecision = (value: number, precision = 10): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

/** habit-hooks-disable non-essential-comment
 * About `targetTickCount` evenly spaced nice ticks from 0; the last tick is always >= `max`.
 */
export const buildTicksForChart = (max: number, targetTickCount = 10): number[] => {
  if (max <= 0) return [0];

  const rawIncrement = max / targetTickCount;
  const niceIncrement = roundToNiceNumber(rawIncrement);

  const ticks: number[] = [];
  for (let value = 0; value <= max + niceIncrement * 0.5; value += niceIncrement) {
    ticks.push(roundToPrecision(value));
  }

  const lastTick = ticks[ticks.length - 1];
  if (lastTick < max) {
    ticks.push(roundToPrecision(lastTick + niceIncrement));
  }

  return ticks;
};
