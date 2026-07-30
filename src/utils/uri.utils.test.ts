import { describe, expect, it } from 'vitest';
import {
  decodeUrl,
  encodeUrl,
  extractBase64FromDataUri,
  formatDataUri,
  getBase64ApproxSize,
  hasScheme,
  isValidDataUri,
  SCHEME_PREFIXES,
} from './uri.utils';

describe('Tests suite for URI utilities', () => {
  describe('SCHEME_PREFIXES', () => {
    it('should contain expected scheme prefixes', () => {
      // assert
      expect(SCHEME_PREFIXES).toEqual({
        file: 'file',
        content: 'content',
        http: 'http',
        https: 'https',
        ftp: 'ftp',
        ftps: 'ftps',
        sftp: 'sftp',
        smb: 'smb',
      });
    });
  });

  describe('hasScheme', () => {
    it.each`
      uri                                | expected | description
      ${'http://example.com'}            | ${true}  | ${'http scheme'}
      ${'https://example.com'}           | ${true}  | ${'https scheme'}
      ${'ftp://files.example.com'}       | ${true}  | ${'ftp scheme'}
      ${'ftps://secure.example.com'}     | ${true}  | ${'ftps scheme'}
      ${'sftp://server.example.com'}     | ${true}  | ${'sftp scheme'}
      ${'smb://share/folder'}            | ${true}  | ${'smb scheme'}
      ${'file:///path/to/file'}          | ${true}  | ${'file scheme'}
      ${'content://provider/data'}       | ${true}  | ${'content scheme'}
      ${'HTTP://EXAMPLE.COM'}            | ${true}  | ${'uppercase http scheme'}
      ${'HTTPS://EXAMPLE.COM'}           | ${true}  | ${'uppercase https scheme'}
      ${'HtTp://MiXeD.CaSe.CoM'}         | ${true}  | ${'mixed case scheme'}
      ${'/path/to/file'}                 | ${false} | ${'absolute path without scheme'}
      ${'path/to/file'}                  | ${false} | ${'relative path'}
      ${'example.com'}                   | ${false} | ${'domain without scheme'}
      ${'mailto:test@example.com'}       | ${false} | ${'mailto scheme (not supported)'}
      ${'tel:+1234567890'}               | ${false} | ${'tel scheme (not supported)'}
      ${''}                              | ${false} | ${'empty string'}
      ${null}                            | ${false} | ${'null value'}
      ${undefined}                       | ${false} | ${'undefined value'}
    `('should return $expected for $description', ({ uri, expected }) => {
      // act
      const result = hasScheme(uri);
      // assert
      expect(result).toBe(expected);
    });
  });

  describe('isValidDataUri', () => {
    it.each`
      uri                                                                                      | expected | description
      ${'data:image/png;base64,iVBORw0KGgo='}                                                  | ${true}  | ${'valid PNG data URI'}
      ${'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4='} | ${true}  | ${'valid SVG data URI'}
      ${'data:application/json;base64,eyJrZXkiOiJ2YWx1ZSJ9'}                                   | ${true}  | ${'valid JSON data URI'}
      ${'data:text/plain,hello'}                                                                 | ${false} | ${'data URI without base64 encoding'}
      ${'data:image/png;base64,'}                                                                | ${false} | ${'data URI with empty base64 payload'}
      ${'http://example.com/image.png'}                                                          | ${false} | ${'HTTP URL'}
      ${'/path/to/file.png'}                                                                     | ${false} | ${'absolute path'}
      ${''}                                                                                      | ${false} | ${'empty string'}
      ${'   '}                                                                                   | ${false} | ${'blank string'}
      ${null}                                                                                    | ${false} | ${'null value'}
      ${undefined}                                                                               | ${false} | ${'undefined value'}
    `('should return $expected for $description', ({ uri, expected }) => {
      // Act
      const result = isValidDataUri(uri);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe('encodeUrl and decodeUrl', () => {
    it('encodes and decodes URL components', () => {
      // act
      const encoded = encodeUrl('hello world');
      const decoded = decodeUrl(encoded);
      // assert
      expect(encoded).toBe('hello%20world');
      expect(decoded).toBe('hello world');
    });

    it('returns empty string for blank input', () => {
      // act
      const encoded = encodeUrl();
      const decoded = decodeUrl();
      // assert
      expect(encoded).toBe('');
      expect(decoded).toBe('');
    });

    it('returns original value when decode fails', () => {
      // act
      const result = decodeUrl('%E0%A4%A');
      // assert
      expect(result).toBe('%E0%A4%A');
    });
  });

  describe('formatDataUri', () => {
    it('builds a base64 data URI', () => {
      // act
      const result = formatDataUri({ mimeType: 'image/png', base64: 'abc' });
      // assert
      expect(result).toBe('data:image/png;base64,abc');
    });
  });

  describe('getBase64ApproxSize', () => {
    it('estimates decoded byte size', () => {
      // act
      const result = getBase64ApproxSize('abcd');
      // assert
      expect(result).toBe(3);
    });
  });

  describe('extractBase64FromDataUri', () => {
    it.each`
      dataUri                          | expected
      ${'data:image/png;base64,ABC'}   | ${'ABC'}
      ${'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4='} | ${'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4='}
      ${'data:text/plain,hello'}       | ${'hello'}
      ${'no-comma'}                    | ${'no-comma'}
      ${''}                            | ${''}
      ${'data:,'}                      | ${''}
    `('should return "$expected" for dataUri "$dataUri"', ({ dataUri, expected }) => {
      // act
      const result = extractBase64FromDataUri(dataUri);
      // assert
      expect(result).toBe(expected);
    });
  });
});
