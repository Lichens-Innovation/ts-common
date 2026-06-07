import mime from "mime";

import { DATA_URI_PATTERN, isValidDataUri } from "~/utils/uri.utils";
import { VALID_IMAGE_TYPES } from './mime.utils';

export { VALID_IMAGE_TYPES } from './mime.utils';

export interface ParseDataUriResult {
  mimeType: string;
  base64: string;
  ext: string;
}

export const parseDataUri = (input: string): ParseDataUriResult | null => {
  if (!isValidDataUri(input)) return null;

  const match = DATA_URI_PATTERN.exec(input);
  if (!match) return null;

  const [, mimeType, base64] = match;
  if (!mimeType || !base64) return null;

  return { mimeType, base64, ext: mimeToExt(mimeType) };
};

export const isImageMimeType = (mimeType: string): boolean => {
  return VALID_IMAGE_TYPES.includes(mimeType);
};

export const isValidImageFile = (file: { type: string }): boolean => {
  return isImageMimeType(file.type);
};

export const getExtensionFromDataUri = (dataUri: string): string => {
  const parsed = parseDataUri(dataUri);
  if (!parsed) return 'bin';

  return parsed.ext;
};

export const getImagePreviewSrc = (input: string): string | null => {
  const parsed = parseDataUri(input);
  if (!parsed) return null;
  if (!isImageMimeType(parsed.mimeType)) return null;

  return input;
};

export const mimeToExt = (mimeType: string): string => {
  const ext = mime.getExtension(mimeType);
  if (ext) return ext;

  const subtype = mimeType.split("/")[1] ?? mimeType;
  return subtype.split("+")[0] ?? subtype;
};

export const getMimeType = (extension: string): string => {
  const mimeType = mime.getType(extension);
  if (!mimeType) {
    throw new Error(`[getMimeType] Mime type not found for extension: "${extension}"`);
  }

  return mimeType;
};

