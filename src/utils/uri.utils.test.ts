import { describe, expect, it } from 'vitest';
import { hasScheme, SCHEME_PREFIXES } from './uri.utils';

describe('Tests suite for URI utilities', () => {
  describe('SCHEME_PREFIXES', () => {
    it('should contain expected scheme prefixes', () => {
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
      expect(hasScheme(uri)).toBe(expected);
    });
  });
});
