import { describe, expect, it } from 'vitest';
import { REGEX_ALPHANUMERIC, REGEX_IPV4 } from './regex';

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

  describe('REGEX_IPV4', () => {
    it.each`
      value                | expected
      ${'0.0.0.0'}         | ${true}
      ${'255.255.255.255'} | ${true}
      ${'192.168.1.1'}     | ${true}
      ${'10.0.0.1'}        | ${true}
      ${'127.0.0.1'}       | ${true}
      ${'1.2.3.4'}         | ${true}
      ${'01.02.03.04'}     | ${true}
      ${'249.249.249.249'} | ${true}
      ${''}                | ${false}
      ${'256.0.0.0'}       | ${false}
      ${'0.256.0.0'}       | ${false}
      ${'0.0.256.0'}       | ${false}
      ${'0.0.0.256'}       | ${false}
      ${'1.2.3.4.5'}       | ${false}
      ${'1.2.3'}           | ${false}
      ${'1.2'}             | ${false}
      ${'abc.def.ghi.jkl'} | ${false}
      ${'192.168.1.1 '}    | ${false}
      ${' 192.168.1.1'}    | ${false}
      ${'192.168.1'}       | ${false}
      ${'192.168.1.'}      | ${false}
      ${'.192.168.1.1'}    | ${false}
      ${'192..168.1.1'}    | ${false}
      ${'999.999.999.999'} | ${false}
    `('should return $expected for "$value"', ({ value, expected }) => {
      expect(REGEX_IPV4.test(value)).toBe(expected);
    });
  });
});