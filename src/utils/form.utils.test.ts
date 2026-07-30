import { describe, expect, it } from 'vitest';
import {
  parseOptionalFormNumber,
  toFormString,
  toFormStringInteger,
} from './form.utils';

describe('Tests suite for form utilities', () => {
  describe('parseOptionalFormNumber', () => {
    it.each`
      value      | expected
      ${null}    | ${null}
      ${undefined} | ${null}
      ${''}      | ${null}
      ${'   '}   | ${null}
      ${'\t\n'}  | ${null}
      ${'0'}     | ${0}
      ${'42'}    | ${42}
      ${'-3.14'} | ${-3.14}
      ${'3.14'}  | ${3.14}
      ${' 42 '}  | ${42}
      ${'1e2'}   | ${100}
      ${'abc'}   | ${null}
      ${'12abc'} | ${null}
      ${'Infinity'} | ${null}
    `('should return $expected for "$value"', ({ value, expected }) => {
      // act
      const result = parseOptionalFormNumber(value);
      // assert
      expect(result).toBe(expected);
    });
  });

  describe('toFormString', () => {
    it.each`
      n           | expected
      ${null}     | ${''}
      ${undefined} | ${''}
      ${0}        | ${'0'}
      ${42}       | ${'42'}
      ${-3.14}    | ${'-3.14'}
      ${3.14}     | ${'3.14'}
      ${NaN}      | ${''}
      ${Infinity} | ${''}
      ${-Infinity} | ${''}
    `('should return "$expected" for $n', ({ n, expected }) => {
      // act
      const result = toFormString(n);
      // assert
      expect(result).toBe(expected);
    });
  });

  describe('toFormStringInteger', () => {
    it.each`
      n                      | expected
      ${null}                | ${''}
      ${undefined}           | ${''}
      ${NaN}                 | ${''}
      ${Infinity}            | ${''}
      ${-Infinity}           | ${''}
      ${42}                  | ${'42'}
      ${42.3}                | ${'42'}
      ${42.7}                | ${'43'}
      ${0}                   | ${'0'}
      ${-1.5}                | ${'-1'}
      ${3700.0000000000005}  | ${'3700'}
    `('should return "$expected" for $n', ({ n, expected }) => {
      // act
      const result = toFormStringInteger(n);
      // assert
      expect(result).toBe(expected);
    });
  });
});
