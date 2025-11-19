import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors.utils';

describe('Tests suite for errors utilities', () => {
  describe('getErrorMessage', () => {
    it.each`
      error                                    | expected
      ${'Simple error message'}                | ${'Simple error message'}
      ${''}                                    | ${''}
      ${new Error('Error object message')}     | ${'Error object message'}
      ${{ message: 'Object with message' }}    | ${'Object with message'}
      ${{ message: '' }}                       | ${''}
      ${null}                                  | ${''}
      ${undefined}                             | ${''}
      ${false}                                 | ${''}
      ${0}                                     | ${''}
      ${{}}                                    | ${'{}'}
      ${{ key: 'value' }}                      | ${'{"key":"value"}'}
      ${[]}                                    | ${'[]'}
      ${[1, 2, 3]}                             | ${'[1,2,3]'}
      ${42}                                    | ${'42'}
      ${true}                                  | ${'true'}
    `('should return "$expected" for error=$error', ({ error, expected }) => {
      expect(getErrorMessage(error)).toBe(expected);
    });
  });
});

