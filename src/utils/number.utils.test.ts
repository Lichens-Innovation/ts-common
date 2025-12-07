import { describe, expect, it } from 'vitest';
import { roundUpToNearest10, toFixed } from './number.utils';

describe('Tests suite for number utilities', () => {
  describe('roundUpToNearest10', () => {
    it.each`
      value        | expected
      ${10}        | ${10}
      ${11}        | ${20}
      ${19}        | ${20}
      ${288}       | ${290}
      ${null}      | ${0}
      ${undefined} | ${0}
    `('should return $expected for value=$value', ({ value, expected }) => {
      expect(roundUpToNearest10(value)).toBe(expected);
    });
  });
  describe('toFixed', () => {
    it.each`
      value      | decimals | expected
      ${3.14159} | ${3}     | ${3.142}
      ${3.14159} | ${2}     | ${3.14}
      ${3.14159} | ${1}     | ${3.1}
      ${3.14159} | ${0}     | ${3}
      ${3.5}     | ${0}     | ${4}
      ${3.4}     | ${0}     | ${3}
      ${10.999}  | ${2}     | ${11}
      ${10.995}  | ${2}     | ${11}
      ${10.994}  | ${2}     | ${10.99}
      ${-3.14159}| ${2}     | ${-3.14}
      ${0}       | ${2}     | ${0}
      ${0.1}     | ${1}     | ${0.1}
      ${0.05}    | ${1}     | ${0.1}
      ${0.04}    | ${1}     | ${0}
      ${null}    | ${2}     | ${0}
      ${undefined}| ${2}    | ${0}
      ${3.14159} | ${undefined}| ${3}
    `('should return $expected for value=$value and decimals=$decimals', ({ value, decimals, expected }) => {
      expect(toFixed(value, decimals)).toBe(expected);
    });

    it('should throw error when decimals is negative', () => {
      expect(() => toFixed(3.14, -1)).toThrow('[toFixed] decimals must be >= 0');
    });
  });
});

