import { isBlank } from "./string.utils";

export const getFileExtension = (filename?: string | null): string => {
  if (isBlank(filename)) {
    return "";
  }

  return filename.split(".").pop()?.toLowerCase() ?? "";
};
