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
      const encoded = encodeBase64(text);
      expect(decodeBase64(encoded)).toBe(text);
    });

    it('encodes ASCII to known base64', () => {
      expect(encodeBase64('hello')).toBe('aGVsbG8=');
    });

    it('returns empty string on invalid decode input gracefully', () => {
      expect(decodeBase64('!!!invalid!!!')).toBe('');
    });
  });
});
