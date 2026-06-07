import { isBlank } from ".";

export const SCHEME_PREFIXES = {
  file: 'file',
  content: 'content',
  http: 'http',
  https: 'https',
  ftp: 'ftp',
  ftps: 'ftps',
  sftp: 'sftp',
  smb: 'smb',
} as const;

const SCHEME_PREFIXES_ARRAY = Object.values(SCHEME_PREFIXES);

export const DATA_URI_PATTERN = /^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/;

export const isValidDataUri = (uri?: string | null): boolean => {
  if (isBlank(uri)) {
    return false;
  }

  return DATA_URI_PATTERN.test(uri);
};

export const hasScheme = (uri?: string | null): boolean => {
  if (!uri) {
    return false;
  }

  const lowerUri = uri.toLowerCase();
  return SCHEME_PREFIXES_ARRAY.some((prefix) => lowerUri.startsWith(`${prefix}://`));
};

/**
 * Extracts the base64 data from a data URI string.
 * Data URIs have the format: data:[<mediatype>][;base64],<data>
 * This function extracts everything after the first comma.
 *
 * @param dataUri - The data URI string (e.g., "data:image/png;base64,iVBORw0KG...")
 * @returns The base64 data without the data URI prefix, or the original string if no comma is found
 */
export const extractBase64FromDataUri = (dataUri: string): string => {
  return dataUri.split(',')[1] ?? dataUri;
};
