import { isBlank } from "./string.utils";

export const getFileExtension = (filename?: string | null): string => {
  if (isBlank(filename)) {
    return "";
  }

  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex <= 0) {
    // No dot (-1), or dot is at start (0)
    // hidden file without extension
    return lastDotIndex === 0 ? filename.slice(1).toLowerCase() : "";
  }

  return filename.slice(lastDotIndex + 1).toLowerCase();
};
