import { isBlank } from "./string.utils";

export const getFileExtension = (filename?: string | null): string => {
  if (isBlank(filename)) {
    return "";
  }

  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    // No dot, or dot is at start (hidden file without extension)
    return lastDotIndex === 0 ? filename.slice(1).toLowerCase() : "";
  }

  return filename.slice(lastDotIndex + 1).toLowerCase();
};
