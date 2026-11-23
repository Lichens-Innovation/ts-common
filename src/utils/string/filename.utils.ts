import { isBlank } from './string.utils';

export const getFileExtension = (filename?: string | null): string => {
  if (isBlank(filename)) {
    return '';
  }

  const lastDotIndex = filename.lastIndexOf('.');
  const hasNoDot = lastDotIndex === -1;
  if (hasNoDot) {
    return '';
  }

  const isDotfile = lastDotIndex === 0;
  if (isDotfile) {
    return filename.slice(1).toLowerCase();
  }

  return filename.slice(lastDotIndex + 1).toLowerCase();
};
