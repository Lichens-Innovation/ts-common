import { isNullish } from '../runtime/types.utils';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const isHighSurrogate = (codeUnit: number): boolean => codeUnit >= 0xd800 && codeUnit <= 0xdbff;

const isLowSurrogate = (codeUnit: number): boolean => codeUnit >= 0xdc00 && codeUnit <= 0xdfff;

const toCodePoints = (text: string): number[] => {
  const codePoints: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const codeUnit = text.charCodeAt(i);
    const next = text.charCodeAt(i + 1);
    if (isHighSurrogate(codeUnit) && isLowSurrogate(next)) {
      codePoints.push(0x10000 + ((codeUnit - 0xd800) << 10) + (next - 0xdc00));
      i++;
      continue;
    }
    codePoints.push(codeUnit);
  }

  return codePoints;
};

const codePointToUtf8Bytes = (codePoint: number): number[] => {
  if (codePoint < 0x80) {
    return [codePoint];
  }
  if (codePoint < 0x800) {
    return [0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f)];
  }
  if (codePoint < 0x10000) {
    return [0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f)];
  }
  return [
    0xf0 | (codePoint >> 18),
    0x80 | ((codePoint >> 12) & 0x3f),
    0x80 | ((codePoint >> 6) & 0x3f),
    0x80 | (codePoint & 0x3f),
  ];
};

const encodeUtf8ToBytes = (text: string): number[] => toCodePoints(text).flatMap(codePointToUtf8Bytes);

interface DecodedCodePoint {
  codePoint: number;
  byteCount: number;
}

const readCodePoint = (bytes: number[], i: number): DecodedCodePoint => {
  const byteAt = (offset: number): number => bytes[i + offset] ?? 0;
  const continuation = (offset: number): number => byteAt(offset) & 0x3f;
  const b0 = byteAt(0);

  if (b0 < 0x80) {
    return { codePoint: b0, byteCount: 1 };
  }
  if ((b0 & 0xe0) === 0xc0) {
    return { codePoint: ((b0 & 0x1f) << 6) | continuation(1), byteCount: 2 };
  }
  if ((b0 & 0xf0) === 0xe0) {
    return { codePoint: ((b0 & 0x0f) << 12) | (continuation(1) << 6) | continuation(2), byteCount: 3 };
  }
  return {
    codePoint: ((b0 & 0x07) << 18) | (continuation(1) << 12) | (continuation(2) << 6) | continuation(3),
    byteCount: 4,
  };
};

const codePointToString = (codePoint: number): string => {
  if (codePoint <= 0xffff) {
    return String.fromCharCode(codePoint);
  }
  const adjusted = codePoint - 0x10000;
  return String.fromCharCode(0xd800 + (adjusted >> 10), 0xdc00 + (adjusted & 0x3ff));
};

const decodeUtf8FromBytes = (bytes: number[]): string => {
  let result = '';
  let i = 0;

  while (i < bytes.length) {
    const { codePoint, byteCount } = readCodePoint(bytes, i);
    result += codePointToString(codePoint);
    i += byteCount;
  }

  return result;
};

const encodeBytesToBase64 = (bytes: number[]): string => {
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    const triplet = (b0 << 16) | (b1 << 8) | b2;

    output += BASE64_CHARS[(triplet >> 18) & 0x3f];
    output += BASE64_CHARS[(triplet >> 12) & 0x3f];
    output += i + 1 < bytes.length ? BASE64_CHARS[(triplet >> 6) & 0x3f] : '=';
    output += i + 2 < bytes.length ? BASE64_CHARS[triplet & 0x3f] : '=';
  }

  return output;
};

const toSextet = (char?: string): number => (isNullish(char) ? -1 : BASE64_CHARS.indexOf(char));

const decodeBase64ToBytes = (base64: string): number[] => {
  const sanitized = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  const bytes: number[] = [];

  for (let i = 0; i < sanitized.length; i += 4) {
    const c0 = toSextet(sanitized[i]);
    const c1 = toSextet(sanitized[i + 1]);
    const c2 = sanitized[i + 2] === '=' ? 0 : toSextet(sanitized[i + 2]);
    const c3 = sanitized[i + 3] === '=' ? 0 : toSextet(sanitized[i + 3]);

    if (c0 < 0 || c1 < 0 || (sanitized[i + 2] !== '=' && c2 < 0) || (sanitized[i + 3] !== '=' && c3 < 0)) {
      throw new Error('Invalid base64 character');
    }

    const triplet = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;

    bytes.push((triplet >> 16) & 0xff);
    if (sanitized[i + 2] !== '=') bytes.push((triplet >> 8) & 0xff);
    if (sanitized[i + 3] !== '=') bytes.push(triplet & 0xff);
  }

  return bytes;
};

export const encodeBase64 = (text: string): string => {
  try {
    return encodeBytesToBase64(encodeUtf8ToBytes(text));
  } catch {
    return '';
  }
};

export const decodeBase64 = (base64: string): string => {
  try {
    return decodeUtf8FromBytes(decodeBase64ToBytes(base64));
  } catch {
    return '';
  }
};
