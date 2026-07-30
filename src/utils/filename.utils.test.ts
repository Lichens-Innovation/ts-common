import { describe, expect, it } from 'vitest';
import { getFileExtension } from './filename.utils';

describe('Tests suite for filename utilities', () => {
  describe('getFileExtension', () => {
    it.each`
      filename        | expected
      ${null}         | ${''}
      ${undefined}    | ${''}
      ${''}           | ${''}
      ${'   '}        | ${''}
      ${'\t\n'}       | ${''}
      ${'file.pdf'}   | ${'pdf'}
      ${'file.PDF'}   | ${'pdf'}
      ${'doc.xlsx'}   | ${'xlsx'}
      ${'image.JPEG'} | ${'jpeg'}
      ${'a.b.c'}      | ${'c'}
      ${'.hidden'}    | ${'hidden'}
      ${'noextension'} | ${''}
      ${'file.'}      | ${''}
    `('should return "$expected" for "$filename"', ({ filename, expected }) => {
      // act
      const result = getFileExtension(filename);
      // assert
      expect(result).toBe(expected);
    });
  });
});
