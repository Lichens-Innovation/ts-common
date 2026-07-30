import { describe, expect, it } from 'vitest';
import {
  formatJson,
  isMinifiedJson,
  isValidJson,
  minifyJson,
  prettifyJson,
  safeJsonParse,
  safeJsonStringify,
} from './json.utils';

describe('json.utils', () => {
  describe('safeJsonParse', () => {
    it('parses valid JSON', () => {
      // act
      const result = safeJsonParse('{"a":1}');
      // assert
      expect(result).toEqual({ a: 1 });
    });

    it('returns fallback on invalid JSON', () => {
      // act
      const result = safeJsonParse('not json', { ok: false });
      // assert
      expect(result).toEqual({ ok: false });
    });
  });

  describe('safeJsonStringify', () => {
    it('stringifies objects with indentation', () => {
      // act
      const result = safeJsonStringify({ a: 1 });
      // assert
      expect(result).toBe('{\n  "a": 1\n}');
    });

    it('returns empty string for falsy values', () => {
      // act
      const result = safeJsonStringify(null);
      // assert
      expect(result).toBe('');
    });
  });

  describe('formatJson', () => {
    it('prettifies JSON string', () => {
      // act
      const result = formatJson({ value: '{"b":2,"a":1}', sortKeys: true });
      // assert
      expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
    });

    it('returns original value when parsing fails', () => {
      // act
      const result = formatJson({ value: 'not json' });
      // assert
      expect(result).toBe('not json');
    });
  });

  describe('prettifyJson and minifyJson', () => {
    const input = '{"b":2,"a":1}';

    it('prettifies with sorted keys', () => {
      // act
      const result = prettifyJson(input);
      // assert
      expect(result).toContain('"a": 1');
    });

    it('minifies with sorted keys', () => {
      // act
      const result = minifyJson(input);
      // assert
      expect(result).toBe('{"a":1,"b":2}');
    });
  });

  describe('isValidJson', () => {
    it.each`
      value        | expected
      ${'{"a":1}'} | ${true}
      ${'not json'}| ${false}
    `('returns $expected for "$value"', ({ value, expected }) => {
      // act
      const result = isValidJson(value);
      // assert
      expect(result).toBe(expected);
    });
  });

  describe('isMinifiedJson', () => {
    it('returns true for minified JSON', () => {
      // act
      const result = isMinifiedJson('{"a":1}');
      // assert
      expect(result).toBe(true);
    });

    it('returns false for pretty JSON', () => {
      // act
      const result = isMinifiedJson('{\n  "a": 1\n}');
      // assert
      expect(result).toBe(false);
    });
  });
});
