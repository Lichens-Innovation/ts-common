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
