import { format } from 'date-fns';
import { isNullish } from '../runtime/types.utils';

export type DateInput = Date | string | number | null;

export const dateAs_HHMMSS = (value?: DateInput) => {
  if (isNullish(value)) return '';
  return format(value, 'HH:mm:ss');
};

export const dateAs_YYYYMMDD = (value?: DateInput) => {
  if (isNullish(value)) return '';
  return format(value, 'yyyy-MM-dd');
};

export const dateAs_YYYYMMDD_HHMMSS = (value?: DateInput) => {
  if (isNullish(value)) return '';
  return format(value, 'yyyy-MM-dd HH:mm:ss');
};

export const nowAsTime = () => dateAs_HHMMSS(new Date());
export const nowAsDate = () => dateAs_YYYYMMDD(new Date());
export const nowAsDateTime = () => dateAs_YYYYMMDD_HHMMSS(new Date());

export const nowAsDateTimeForFilename = () => {
  return format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
};

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss';

/** habit-hooks-disable non-essential-comment
 * `timestamp` is in seconds since epoch; returns `N/A` for 0 and `Invalid date` when formatting fails.
 */
export const formatUnixTimestamp = (timestamp: number, dateFormat: string = DEFAULT_DATE_FORMAT): string => {
  if (!timestamp) return 'N/A';
  try {
    return format(new Date(timestamp * 1000), dateFormat);
  } catch {
    return 'Invalid date';
  }
};

export const getCurrentUnixTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

/** habit-hooks-disable non-essential-comment
 * `timestamp` is in seconds since epoch; expired means strictly in the past.
 */
export const isExpiredTimestamp = (timestamp: number): boolean => {
  const now = getCurrentUnixTimestamp();
  return timestamp < now;
};

/** habit-hooks-disable non-essential-comment
 * `timestamp` is in seconds since epoch; active means now or in the past.
 */
export const isActiveTimestamp = (timestamp: number): boolean => {
  const now = getCurrentUnixTimestamp();
  return timestamp <= now;
};

export const dateToNumberRange = (range: [Date, Date]): [number, number] => {
  const [start, end] = range;
  return [start.getTime(), end.getTime()];
};

export const numberToDateRange = (range: [number, number]): [Date, Date] => {
  const [start, end] = range;
  return [new Date(start), new Date(end)];
};
