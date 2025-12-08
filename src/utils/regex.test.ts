import { describe, expect, it } from 'vitest';
import { REGEX_ALPHANUMERIC } from './regex';

describe('Tests suite for known regexes', () => {
    describe('REGEX_ALPHANUMERIC', () => {
    it.each`
      value          | expected
      ${''}          | ${false}
      ${'abc123'}    | ${true}
      ${'ABC'}       | ${true}
      ${'12345'}     | ${true}
      ${'a1b2c3'}    | ${true}
      ${'abc 123'}   | ${true}
      ${'123_abc'}   | ${true}
      ${'!@#$%'}     | ${false}
      ${'abc123!'}   | ${false}
      ${'Père Noël'} | ${false}
    `('should return $expected for "$value"', ({ value, expected }) => {
      expect(REGEX_ALPHANUMERIC.test(value)).toBe(expected);
    });
  });
});