import { isBlank } from './string.utils';

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
  if (isBlank(uri)) {
    return false;
  }

  const lowerUri = uri.toLowerCase();
  return SCHEME_PREFIXES_ARRAY.some((prefix) => lowerUri.startsWith(`${prefix}://`));
};

/** habit-hooks-disable non-essential-comment
 * Returns the part after the first comma of `data:[<mediatype>][;base64],<data>`,
 * or the input unchanged when it has no comma.
 */
export const extractBase64FromDataUri = (dataUri: string): string => {
  return dataUri.split(',')[1] ?? dataUri;
};

export const encodeUrl = (value?: string): string => {
  return encodeURIComponent(value ?? '');
};

export const decodeUrl = (value?: string): string => {
  const encoded = value ?? '';
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
};

interface FormatDataUriArgs {
  mimeType: string;
  base64: string;
}

export const formatDataUri = ({ mimeType, base64 }: FormatDataUriArgs): string => {
  return `data:${mimeType};base64,${base64}`;
};

export const getBase64ApproxSize = (base64: string): number => {
  return Math.round((base64.length * 3) / 4);
};
