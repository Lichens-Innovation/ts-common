const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const encodeUtf8ToBytes = (text: string): number[] => {
  const codePoints: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const codeUnit = text.charCodeAt(i);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        codePoints.push(0x10000 + ((codeUnit - 0xd800) << 10) + (next - 0xdc00));
        i++;
        continue;
      }
    }
    codePoints.push(codeUnit);
  }

  const bytes: number[] = [];
  for (const codePoint of codePoints) {
    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }

  return bytes;
};

const decodeUtf8FromBytes = (bytes: number[]): string => {
  let result = '';
  let i = 0;

  while (i < bytes.length) {
    const b0 = bytes[i]!;
    let codePoint: number;

    if (b0 < 0x80) {
      codePoint = b0;
      i += 1;
    } else if ((b0 & 0xe0) === 0xc0) {
      codePoint = ((b0 & 0x1f) << 6) | (bytes[i + 1]! & 0x3f);
      i += 2;
    } else if ((b0 & 0xf0) === 0xe0) {
      codePoint = ((b0 & 0x0f) << 12) | ((bytes[i + 1]! & 0x3f) << 6) | (bytes[i + 2]! & 0x3f);
      i += 3;
    } else {
      codePoint =
        ((b0 & 0x07) << 18) |
        ((bytes[i + 1]! & 0x3f) << 12) |
        ((bytes[i + 2]! & 0x3f) << 6) |
        (bytes[i + 3]! & 0x3f);
      i += 4;
    }

    if (codePoint <= 0xffff) {
      result += String.fromCharCode(codePoint);
    } else {
      const adjusted = codePoint - 0x10000;
      result += String.fromCharCode(0xd800 + (adjusted >> 10), 0xdc00 + (adjusted & 0x3ff));
    }
  }

  return result;
};

const encodeBytesToBase64 = (bytes: number[]): string => {
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = i + 1 < bytes.length ? bytes[i + 1]! : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2]! : 0;
    const triplet = (b0 << 16) | (b1 << 8) | b2;

    output += BASE64_CHARS[(triplet >> 18) & 0x3f];
    output += BASE64_CHARS[(triplet >> 12) & 0x3f];
    output += i + 1 < bytes.length ? BASE64_CHARS[(triplet >> 6) & 0x3f] : '=';
    output += i + 2 < bytes.length ? BASE64_CHARS[triplet & 0x3f] : '=';
  }

  return output;
};

const decodeBase64ToBytes = (base64: string): number[] => {
  const sanitized = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  const bytes: number[] = [];

  for (let i = 0; i < sanitized.length; i += 4) {
    const c0 = BASE64_CHARS.indexOf(sanitized[i]!);
    const c1 = BASE64_CHARS.indexOf(sanitized[i + 1]!);
    const c2 = sanitized[i + 2] === '=' ? 0 : BASE64_CHARS.indexOf(sanitized[i + 2]!);
    const c3 = sanitized[i + 3] === '=' ? 0 : BASE64_CHARS.indexOf(sanitized[i + 3]!);

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
