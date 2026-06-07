import { describe, expect, it } from 'vitest';
import {
  getImagePreviewSrc,
  getMimeType,
  isImageMimeType,
  mimeToExt,
  parseDataUri,
} from './index';

const PNG_DATA_URI = 'data:image/png;base64,iVBORw0KGgo=';
const JPEG_DATA_URI = 'data:image/jpeg;base64,/9j/4AAQ=';
const SVG_DATA_URI =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=';
const TEXT_DATA_URI = 'data:text/plain;base64,SGVsbG8=';

describe('MIME utilities', () => {
  describe('parseDataUri', () => {
    it('should parse a valid PNG data URI', () => {
      // Arrange
      const input = PNG_DATA_URI;

      // Act
      const result = parseDataUri(input);

      // Assert
      expect(result).toEqual({
        mimeType: 'image/png',
        base64: 'iVBORw0KGgo=',
        ext: 'png',
      });
    });

    it('should parse a valid SVG data URI', () => {
      // Arrange
      const input = SVG_DATA_URI;

      // Act
      const result = parseDataUri(input);

      // Assert
      expect(result).toEqual({
        mimeType: 'image/svg+xml',
        base64: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=',
        ext: 'svg',
      });
    });

    it.each`
      input                        | description
      ${'data:text/plain,hello'}   | ${'non-base64 data URI'}
      ${'http://example.com'}      | ${'HTTP URL'}
      ${''}                        | ${'empty string'}
      ${'data:image/png;base64,'}  | ${'empty base64 payload'}
    `('should return null for $description', ({ input }) => {
      // Act
      const result = parseDataUri(input);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('isImageMimeType', () => {
    it.each`
      mimeType              | expected | description
      ${'image/png'}        | ${true}  | ${'PNG'}
      ${'image/jpeg'}       | ${true}  | ${'JPEG'}
      ${'image/webp'}       | ${true}  | ${'WebP'}
      ${'image/svg+xml'}    | ${true}  | ${'SVG'}
      ${'text/plain'}       | ${false} | ${'plain text'}
      ${'application/pdf'}  | ${false} | ${'PDF'}
      ${'image/unknown'}    | ${false} | ${'unknown image type'}
    `('should return $expected for $description', ({ mimeType, expected }) => {
      // Act
      const result = isImageMimeType(mimeType);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe('getImagePreviewSrc', () => {
    it('should return the input for a valid image data URI', () => {
      // Arrange
      const input = PNG_DATA_URI;

      // Act
      const result = getImagePreviewSrc(input);

      // Assert
      expect(result).toBe(input);
    });

    it.each`
      input              | description
      ${TEXT_DATA_URI}   | ${'non-image data URI'}
      ${JPEG_DATA_URI.replace('jpeg', 'octet-stream')} | ${'unsupported image MIME type'}
      ${'not-a-data-uri'}| ${'invalid data URI'}
    `('should return null for $description', ({ input }) => {
      // Act
      const result = getImagePreviewSrc(input);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('mimeToExt', () => {
    it.each`
      mimeType              | expected | description
      ${'image/png'}        | ${'png'} | ${'known PNG MIME type'}
      ${'image/jpeg'}       | ${'jpg'} | ${'known JPEG MIME type'}
      ${'image/svg+xml'}    | ${'svg'} | ${'known SVG MIME type'}
      ${'application/pdf'}  | ${'pdf'} | ${'known PDF MIME type'}
    `('should return "$expected" for $description', ({ mimeType, expected }) => {
      // Act
      const result = mimeToExt(mimeType);

      // Assert
      expect(result).toBe(expected);
    });

    it('should fall back to the subtype when the MIME type is unknown', () => {
      // Arrange
      const mimeType = 'application/x-custom+zip';

      // Act
      const result = mimeToExt(mimeType);

      // Assert
      expect(result).toBe('x-custom');
    });
  });

  describe('getMimeType', () => {
    it.each`
      extension | expected
      ${'csv'}  | ${'text/csv'}
      ${'xlsx'} | ${'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
      ${'pdf'}  | ${'application/pdf'}
      ${'png'}  | ${'image/png'}
      ${'jpg'}  | ${'image/jpeg'}
      ${'json'} | ${'application/json'}
      ${'html'} | ${'text/html'}
      ${'txt'}  | ${'text/plain'}
      ${'svg'}  | ${'image/svg+xml'}
    `('returns "$expected" for extension "$extension"', ({ extension, expected }) => {
      expect(getMimeType(extension)).toBe(expected);
    });

    it('throws when extension is unknown', () => {
      expect(() => getMimeType('unknownxyz')).toThrow(/Mime type not found for extension/);
    });
  });
});
