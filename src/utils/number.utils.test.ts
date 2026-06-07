import { describe, expect, it } from 'vitest';
import {
  formatCount,
  formatDuration,
  formatIntegerDisplay,
  getOrderOfMagnitudeExponent,
  isInputValidInteger,
  isInputValidNegativeInteger,
  isInputValidNumber,
  isInputValidPositiveInteger,
  roundUpToNearest10,
  toFixed,
} from './number.utils';

describe('Tests suite for number utilities', () => {
  describe('getOrderOfMagnitudeExponent', () => {
    it.each`
      value        | expected
      ${10}        | ${1}
      ${11}        | ${1}
      ${19}        | ${1}
      ${288}       | ${2}
      ${0}         | ${0}
      ${-10}       | ${1}
      ${-11}       | ${1}
      ${-19}       | ${1}
      ${-288}      | ${2}
      ${NaN}       | ${0}
      ${null}      | ${0}
      ${undefined} | ${0}
    `('should return $expected for value=$value', ({ value, expected }) => {
      expect(getOrderOfMagnitudeExponent(value)).toBe(expected);
    });
  });

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

  describe('isInputValidNumber', () => {
    it.each`
      value          | expected
      ${''}          | ${false}
      ${'   '}       | ${false}
      ${'abc'}       | ${false}
      ${'12.34'}     | ${true}
      ${'0'}         | ${true}
      ${'-5'}        | ${true}
      ${' 42 '}      | ${true}
      ${'1500.5'}    | ${true}
      ${'1e2'}       | ${true}
      ${'NaN'}       | ${false}
      ${'1.2.3'}     | ${false}
    `('should return $expected for value="$value"', ({ value, expected }) => {
      expect(isInputValidNumber(value)).toBe(expected);
    });
  });

  describe('isInputValidInteger', () => {
    it.each`
      value          | expected
      ${''}          | ${false}
      ${'   '}       | ${false}
      ${'12.34'}     | ${false}
      ${'1500.5'}    | ${false}
      ${'0'}         | ${true}
      ${'42'}        | ${true}
      ${'-7'}        | ${true}
      ${' 100 '}     | ${true}
    `('should return $expected for value="$value"', ({ value, expected }) => {
      expect(isInputValidInteger(value)).toBe(expected);
    });
  });

  describe('isInputValidPositiveInteger', () => {
    it.each`
      value          | expected
      ${''}          | ${false}
      ${'   '}       | ${false}
      ${'0'}         | ${false}
      ${'12.34'}     | ${false}
      ${'1500.5'}    | ${false}
      ${'-7'}        | ${false}
      ${'1'}         | ${true}
      ${'42'}        | ${true}
      ${' 100 '}     | ${true}
    `('should return $expected for value="$value"', ({ value, expected }) => {
      expect(isInputValidPositiveInteger(value)).toBe(expected);
    });
  });

  describe('isInputValidNegativeInteger', () => {
    it.each`
      value          | expected
      ${''}          | ${false}
      ${'   '}       | ${false}
      ${'0'}         | ${false}
      ${'42'}        | ${false}
      ${'12.34'}     | ${false}
      ${'1500.5'}    | ${false}
      ${'-1'}        | ${true}
      ${'-7'}        | ${true}
      ${' -100 '}    | ${true}
    `('should return $expected for value="$value"', ({ value, expected }) => {
      expect(isInputValidNegativeInteger(value)).toBe(expected);
    });
  });

  describe('formatCount', () => {
    it.each`
      count        | expected
      ${500}       | ${'500'}
      ${1500}      | ${'1.5K'}
      ${2_500_000} | ${'2.5M'}
    `('should return $expected for count=$count', ({ count, expected }) => {
      expect(formatCount(count)).toBe(expected);
    });
  });

  describe('formatDuration', () => {
    it.each`
      ms     | expected
      ${150} | ${'150ms'}
      ${2500}| ${'2.5s'}
    `('should return $expected for ms=$ms', ({ ms, expected }) => {
      expect(formatDuration(ms)).toBe(expected);
    });
  });

  describe('formatIntegerDisplay', () => {
    it.each`
      value      | expected
      ${42}      | ${'42'}
      ${42.7}    | ${'43'}
      ${42.3}    | ${'42'}
      ${0}       | ${'0'}
      ${-3.8}    | ${'-4'}
      ${null}    | ${'0'}
      ${undefined} | ${'0'}
    `('should return "$expected" for value=$value', ({ value, expected }) => {
      expect(formatIntegerDisplay(value)).toBe(expected);
    });
  });
});

