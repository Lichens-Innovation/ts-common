export interface ToleranceArea {
  flow: number;
  toleranceRange: [number, number];
}

/**
 * A chart point with required x and y coordinates.
 */
export interface ChartPoint {
  x: number;
  y: number;
}

/**
 * A chart point with optional nullable x and y coordinates.
 */
export interface NullableChartPoint {
  x?: number | null;
  y?: number | null;
}

export const getTickDomain = (ticks: number[]): [number, number] => [0, ticks.at(-1) ?? 0];

export const tickFormatter = (value: number): string => value.toFixed(0);

export const toToleranceLabel = (value: number): string => `±${(value * 100).toFixed(0)}%`;

export const tooltipValueFormatter = (data: unknown): string => {
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

/**
 * Rounds a raw value to a "nice" number for chart axis increments.
 * Nice numbers are easy to read: 1, 2, 2.5, 5, or 10 multiplied by a power of 10.
 *
 * @param rawValue - The raw value to round to a nice number
 * @returns A nice number close to the raw value
 *
 * @example
 * roundToNiceNumber(0.7)  // returns 1
 * roundToNiceNumber(3)    // returns 5
 * roundToNiceNumber(17)   // returns 20
 * roundToNiceNumber(80)   // returns 100
 */
export const roundToNiceNumber = (rawValue: number): number => {
  if (rawValue <= 0) return 0;

  // Get order of magnitude
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawValue)));

  // Normalize to find the multiplier (between 1 and 10)
  const normalized = rawValue / magnitude;

  // Round to nice values: 1, 2, 2.5, 5, 10
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

/**
 * Builds an array of "nice" tick values for a chart axis.
 * The algorithm aims for approximately `targetTickCount` ticks with clean, readable values.
 *
 * @param max - The maximum value to display on the axis
 * @param targetTickCount - The desired number of ticks (default: 10)
 * @returns An array of tick values from 0 to at least `max`
 */
export const buildTicksForChart = (max: number, targetTickCount = 10): number[] => {
  if (max <= 0) return [0];

  // Calculate raw increment for desired tick count and round to nice value
  const rawIncrement = max / targetTickCount;
  const niceIncrement = roundToNiceNumber(rawIncrement);

  // Build ticks from 0 to just past max
  const ticks: number[] = [];
  for (let value = 0; value <= max + niceIncrement * 0.5; value += niceIncrement) {
    // Round to avoid floating point precision issues
    ticks.push(roundToPrecision(value));
  }

  // Ensure we have at least one tick >= max
  const lastTick = ticks[ticks.length - 1];
  if (lastTick < max) {
    ticks.push(roundToPrecision(lastTick + niceIncrement));
  }

  return ticks;
};
