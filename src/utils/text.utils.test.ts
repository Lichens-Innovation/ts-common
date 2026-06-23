import { describe, expect, it } from 'vitest';
import { firstSentence, joinOxford, titleFromName } from './text.utils';

describe('text.utils', () => {
  describe('firstSentence', () => {
    it.each`
      input                              | expected
      ${'Hello world. Second sentence.'} | ${'Hello world.'}
      ${'Hello world! Second sentence.'} | ${'Hello world!'}
      ${'Hello world? Second sentence.'} | ${'Hello world?'}
      ${'Only one sentence'}             | ${'Only one sentence'}
      ${'  Leading spaces. Ignored.'}    | ${'Leading spaces.'}
      ${''}                              | ${''}
      ${'   '}                           | ${''}
    `('firstSentence("$input") → "$expected"', ({ input, expected }) => {
      expect(firstSentence(input)).toBe(expected);
    });
  });

  describe('titleFromName', () => {
    it.each`
      name                 | fallback      | expected
      ${'my-skill'}        | ${undefined}  | ${'My Skill'}
      ${'hello-world'}     | ${undefined}  | ${'Hello World'}
      ${'single'}          | ${undefined}  | ${'Single'}
      ${''}                | ${undefined}  | ${''}
      ${''}                | ${'my-agent'} | ${'My Agent'}
      ${'three-part-name'} | ${undefined}  | ${'Three Part Name'}
    `('titleFromName("$name") → "$expected"', ({ name, fallback, expected }) => {
      const result = fallback !== undefined ? titleFromName({ name, fallback }) : titleFromName({ name });
      expect(result).toBe(expected);
    });
  });

  describe('joinOxford', () => {
    it.each`
      items                   | expected
      ${[]}                   | ${''}
      ${['a']}                | ${'a'}
      ${['a', 'b']}           | ${'a or b'}
      ${['a', 'b', 'c']}      | ${'a, b or c'}
      ${['a', 'b', 'c', 'd']} | ${'a, b, c or d'}
    `('joinOxford($items) → "$expected"', ({ items, expected }) => {
      expect(joinOxford(items)).toBe(expected);
    });
  });
});
