import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64 } from './base64.utils';

describe('base64.utils', () => {
  describe('encodeBase64 / decodeBase64', () => {
    it.each`
      text
      ${'hello'}
      ${'café'}
      ${'你好'}
      ${'emoji: \uD83D\uDE00'}
      ${''}
    `('round-trips "$text"', ({ text }) => {
      // act
      const encoded = encodeBase64(text);
      const decoded = decodeBase64(encoded);
      // assert
      expect(decoded).toBe(text);
    });

    it('encodes ASCII to known base64', () => {
      // act
      const result = encodeBase64('hello');
      // assert
      expect(result).toBe('aGVsbG8=');
    });

    it('returns empty string on invalid decode input gracefully', () => {
      // act
      const result = decodeBase64('!!!invalid!!!');
      // assert
      expect(result).toBe('');
    });
  });
});
