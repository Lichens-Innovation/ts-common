import { describe, expect, it } from 'vitest';
import { getErrorMessage, toError } from './errors.utils';

describe('Tests suite for errors utilities', () => {
  describe('toError', () => {
    it('should return the same Error instance when given an Error', () => {
      // arrange
      const err = new Error('Existing error');

      // act
      const result = toError(err);

      // assert
      expect(result).toBe(err);
      expect(result.message).toBe('Existing error');
    });

    it.each`
      error                                    | expectedMessage
      ${'Simple error message'}                | ${'Simple error message'}
      ${''}                                    | ${''}
      ${{ message: 'Object with message' }}    | ${'Object with message'}
      ${{ message: '' }}                       | ${''}
      ${null}                                  | ${''}
      ${undefined}                             | ${''}
      ${false}                                 | ${''}
      ${0}                                     | ${''}
      ${42}                                    | ${'42'}
      ${true}                                  | ${'true'}
      ${{}}                                    | ${'{}'}
      ${{ key: 'value' }}                      | ${'{"key":"value"}'}
    `('should return a new Error with message "$expectedMessage" for error=$error', ({ error, expectedMessage }) => {
      // act
      const result = toError(error);

      // assert
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe(expectedMessage);
    });
  });

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
      // act
      const result = getErrorMessage(error);
      // assert
      expect(result).toBe(expected);
    });
  });
});

