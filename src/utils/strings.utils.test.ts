import { describe, expect, it } from 'vitest';
import {
  capitalizeFirst,
  countWords,
  isAlphanumeric,
  isBlank,
  isNotBlank,
  removeDiacriticalMarks,
  truncate,
} from './string.utils';

describe('Tests suite for string utilities', () => {
  describe('isAlphanumeric', () => {
    it.each`
      value          | expected
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
      expect(isAlphanumeric(value)).toBe(expected);
    });
  });

  describe('Tests for the removeDiacriticalMarks function', () => {
    it.each`
      value                                           | expected
      ${"Ça va très bien, n'est-ce pas?"}             | ${"Ca va tres bien, n'est-ce pas?"}
      ${'éàùëïö'}                                     | ${'eaueio'}
      ${'Café'}                                       | ${'Cafe'}
      ${'Noël'}                                       | ${'Noel'}
      ${"L'été est là!"}                              | ${"L'ete est la!"}
      ${'München'}                                    | ${'Munchen'}
      ${'José'}                                       | ${'Jose'}
      ${'Fiancée'}                                    | ${'Fiancee'}
      ${'Résumé'}                                     | ${'Resume'}
      ${"À l'école"}                                  | ${"A l'ecole"}
      ${'Süs'}                                        | ${'Sus'}
      ${'naïve'}                                      | ${'naive'}
      ${''}                                           | ${''}
      ${'{{filename}}_{{{yyyy-MM-dd}}}_{{{HHmmss}}}'} | ${'{{filename}}_{{{yyyy-MM-dd}}}_{{{HHmmss}}}'}
    `('should return "$expected" for "$value"', ({ value, expected }) => {
      expect(removeDiacriticalMarks(value)).toBe(expected);
    });
  });

  describe('isBlank', () => {
    it.each`
      value        | expected
      ${null}      | ${true}
      ${undefined} | ${true}
      ${''}        | ${true}
      ${'   '}     | ${true}
      ${'\t\n'}    | ${true}
      ${'hello'}   | ${false}
      ${'  hello'} | ${false}
      ${'hello  '} | ${false}
      ${'0'}       | ${false}
    `('should return $expected for "$value"', ({ value, expected }) => {
      expect(isBlank(value)).toBe(expected);
    });
  });

  describe('isNotBlank', () => {
    it.each`
      value        | expected
      ${null}      | ${false}
      ${undefined} | ${false}
      ${''}        | ${false}
      ${'   '}     | ${false}
      ${'\t\n'}    | ${false}
      ${'hello'}   | ${true}
      ${'  hello'} | ${true}
      ${'hello  '} | ${true}
      ${'0'}       | ${true}
    `('should return $expected for "$value"', ({ value, expected }) => {
      expect(isNotBlank(value)).toBe(expected);
    });
  });

  describe('capitalizeFirst', () => {
    it.each`
      value        | expected
      ${'hello'}   | ${'Hello'}
      ${'Hello'}   | ${'Hello'}
      ${'HELLO'}   | ${'HELLO'}
      ${'h'}       | ${'H'}
      ${''}        | ${''}
      ${null}      | ${null}
      ${undefined} | ${undefined}
      ${'123abc'}  | ${'123abc'}
      ${'éclair'}  | ${'Éclair'}
    `('should return "$expected" for "$value"', ({ value, expected }) => {
      expect(capitalizeFirst(value)).toBe(expected);
    });
  });

  describe('countWords', () => {
    it.each`
      text                          | expected
      ${'hello world'}              | ${2}
      ${'one'}                      | ${1}
      ${'one two three four five'}  | ${5}
      ${'  spaced   out  words  '}  | ${3}
      ${''}                         | ${0}
      ${'   '}                      | ${0}
      ${null}                       | ${0}
      ${undefined}                  | ${0}
      ${'hello\nworld\ttab'}        | ${3}
    `('should return $expected for "$text"', ({ text, expected }) => {
      expect(countWords(text)).toBe(expected);
    });
  });

  describe('truncate', () => {
    it.each`
      str                        | maxLength | ellipsis     | expected
      ${'hello world'}           | ${5}      | ${'...'}     | ${'he...'}
      ${'hello world'}           | ${11}     | ${'...'}     | ${'hello world'}
      ${'hello world'}           | ${12}     | ${'...'}     | ${'hello world'}
      ${'hello'}                 | ${10}     | ${'...'}     | ${'hello'}
      ${'hello world'}           | ${8}      | ${'…'}       | ${'hello w…'}
      ${'short'}                 | ${3}      | ${'...'}     | ${'...'}
      ${''}                      | ${10}     | ${'...'}     | ${''}
      ${null}                    | ${10}     | ${'...'}     | ${null}
      ${undefined}               | ${10}     | ${'...'}     | ${undefined}
    `(
      'should return "$expected" for str="$str", maxLength=$maxLength, ellipsis="$ellipsis"',
      ({ str, maxLength, ellipsis, expected }) => {
        expect(truncate(str, maxLength, ellipsis)).toBe(expected);
      }
    );

    it('should use default ellipsis when not provided', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });
  });
});
