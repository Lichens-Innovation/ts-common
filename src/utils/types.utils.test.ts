import { describe, expect, it } from 'vitest';
import { isNullish, isNumber, isString, NO_OP } from './types.utils';

describe('Tests suite for types utilities', () => {
  describe('isNullish', () => {
    it.each`
      value        | expected
      ${null}      | ${true}
      ${undefined} | ${true}
      ${0}         | ${false}
      ${''}        | ${false}
      ${false}     | ${false}
      ${true}      | ${false}
      ${[]}        | ${false}
      ${{}}        | ${false}
      ${'hello'}   | ${false}
      ${42}        | ${false}
    `('should return $expected for $value', ({ value, expected }) => {
      expect(isNullish(value)).toBe(expected);
    });
  });

  describe('isNumber', () => {
    it.each`
      value        | expected
      ${0}         | ${true}
      ${42}        | ${true}
      ${-42}       | ${true}
      ${3.14}      | ${true}
      ${Infinity}  | ${true}
      ${-Infinity} | ${true}
      ${null}      | ${false}
      ${undefined} | ${false}
      ${'42'}      | ${false}
      ${'hello'}   | ${false}
      ${''}        | ${false}
      ${true}      | ${false}
      ${false}     | ${false}
      ${[]}        | ${false}
      ${{}}        | ${false}
      ${NaN}       | ${false}
    `('should return $expected for $value', ({ value, expected }) => {
      expect(isNumber(value)).toBe(expected);
    });
  });

  describe('isString', () => {
    it.each`
      value        | expected
      ${'hello'}   | ${true}
      ${''}        | ${true}
      ${'42'}      | ${true}
      ${' '}       | ${true}
      ${null}      | ${false}
      ${undefined} | ${false}
      ${42}        | ${false}
      ${0}         | ${false}
      ${true}      | ${false}
      ${false}     | ${false}
      ${[]}        | ${false}
      ${{}}        | ${false}
    `('should return $expected for $value', ({ value, expected }) => {
      expect(isString(value)).toBe(expected);
    });
  });

  describe('NO_OP', () => {
    it('should be a function that does nothing', () => {
      expect(typeof NO_OP).toBe('function');
      expect(NO_OP()).toBeUndefined();
    });
  });
});

