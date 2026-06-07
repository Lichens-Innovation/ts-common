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
      expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
    });

    it('returns fallback on invalid JSON', () => {
      expect(safeJsonParse('not json', { ok: false })).toEqual({ ok: false });
    });
  });

  describe('safeJsonStringify', () => {
    it('stringifies objects with indentation', () => {
      expect(safeJsonStringify({ a: 1 })).toBe('{\n  "a": 1\n}');
    });

    it('returns empty string for falsy values', () => {
      expect(safeJsonStringify(null)).toBe('');
    });
  });

  describe('formatJson', () => {
    it('prettifies JSON string', () => {
      const result = formatJson({ value: '{"b":2,"a":1}', sortKeys: true });
      expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
    });

    it('returns original value when parsing fails', () => {
      expect(formatJson({ value: 'not json' })).toBe('not json');
    });
  });

  describe('prettifyJson and minifyJson', () => {
    const input = '{"b":2,"a":1}';

    it('prettifies with sorted keys', () => {
      expect(prettifyJson(input)).toContain('"a": 1');
    });

    it('minifies with sorted keys', () => {
      expect(minifyJson(input)).toBe('{"a":1,"b":2}');
    });
  });

  describe('isValidJson', () => {
    it.each`
      value        | expected
      ${'{"a":1}'} | ${true}
      ${'not json'}| ${false}
    `('returns $expected for "$value"', ({ value, expected }) => {
      expect(isValidJson(value)).toBe(expected);
    });
  });

  describe('isMinifiedJson', () => {
    it('returns true for minified JSON', () => {
      expect(isMinifiedJson('{"a":1}')).toBe(true);
    });

    it('returns false for pretty JSON', () => {
      expect(isMinifiedJson('{\n  "a": 1\n}')).toBe(false);
    });
  });
});
