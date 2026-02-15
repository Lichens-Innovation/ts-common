import { describe, expect, it } from 'vitest';
import { getMimeType } from './index';

describe('MIME utilities', () => {
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
