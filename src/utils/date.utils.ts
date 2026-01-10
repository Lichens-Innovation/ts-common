import { format } from "date-fns";
import { isNullish } from "./types.utils";

export type DateInput = Date | string | number | null;

export const dateAs_HHMMSS = (value?: DateInput) => {
  if (isNullish(value)) return "";
  return format(value, "HH:mm:ss");
};

export const dateAs_YYYYMMDD = (value?: DateInput) => {
  if (isNullish(value)) return "";
  return format(value, "yyyy-MM-dd");
};

export const dateAs_YYYYMMDD_HHMMSS = (value?: DateInput) => {
  if (isNullish(value)) return "";
  return format(value, "yyyy-MM-dd HH:mm:ss");
};

export const nowAsTime = () => dateAs_HHMMSS(new Date());
export const nowAsDate = () => dateAs_YYYYMMDD(new Date());
export const nowAsDateTime = () => dateAs_YYYYMMDD_HHMMSS(new Date());

export const nowAsDateTimeForFilename = () => {
  return format(new Date(), "yyyy-MM-dd_HH-mm-ss");
};

const DEFAULT_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

/**
 * Format a Unix timestamp (seconds since epoch) to a human-readable string.
 * @param timestamp - Unix timestamp in seconds
 * @param dateFormat - Date format string (default: "yyyy-MM-dd HH:mm:ss")
 * @returns Formatted date string or "N/A" if invalid
 */
export const formatUnixTimestamp = (
  timestamp: number,
  dateFormat: string = DEFAULT_DATE_FORMAT
): string => {
  if (isNullish(timestamp)) return "N/A";

  try {
    return format(new Date(timestamp * 1000), dateFormat);
  } catch {
    return "Invalid date";
  }
};

/**
 * Get the current Unix timestamp in seconds.
 * @returns Current Unix timestamp
 */
export const getCurrentUnixTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Check if a Unix timestamp has expired (is in the past).
 * @param timestamp - Unix timestamp in seconds
 * @returns True if the timestamp is in the past
 */
export const isExpiredTimestamp = (timestamp: number): boolean => {
  const now = getCurrentUnixTimestamp();
  return timestamp < now;
};

/**
 * Check if a Unix timestamp is active (current or past).
 * @param timestamp - Unix timestamp in seconds
 * @returns True if the timestamp is current or in the past
 */
export const isActiveTimestamp = (timestamp: number): boolean => {
  const now = getCurrentUnixTimestamp();
  return timestamp <= now;
};
