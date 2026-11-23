import { isNullish } from '../runtime/types.utils';

/** habit-hooks-disable non-essential-comment
 * m³/s to US gallons per minute.
 */
export const M3PS_TO_GPM = 15850.3;

/** habit-hooks-disable non-essential-comment
 * Pascals to feet of head (1 Pa = 1 N/m²).
 */
export const PA_TO_FT = 0.000334553;

export const W_TO_HP = 0.00134102;

export const M_TO_INCHES = 39.3701;

/** habit-hooks-disable non-essential-comment
 * Hz to RPM, for synchronous speed.
 */
export const HZ_TO_RPM = 60;

export const fromM3psToGPM = (value?: number | null): number => {
  if (isNullish(value)) return 0;

  return value * M3PS_TO_GPM;
};

export const fromPaToFt = (value?: number | null): number => {
  if (isNullish(value)) return 0;

  return value * PA_TO_FT;
};

export const fromWToHp = (value?: number | null): number => {
  if (isNullish(value)) return 0;

  return value * W_TO_HP;
};

export const fromMToInches = (value?: number | null): number => {
  if (isNullish(value)) return 0;

  return value * M_TO_INCHES;
};

export const fromHzToRpm = (value?: number | null): number => {
  if (isNullish(value)) return 0;

  return value * HZ_TO_RPM;
};
