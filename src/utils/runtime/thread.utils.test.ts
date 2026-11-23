import { describe, expect, it } from 'vitest';
import { sleep, yieldToMainThread } from './thread.utils';

const EARLY_FIRE_TOLERANCE_MS = 2;
const EXECUTION_TOLERANCE_MS = 50;

describe('Tests suite for thread utilities', () => {
  describe('sleep', () => {
    it.each`
      milliseconds | description
      ${0}         | ${'0ms'}
      ${10}        | ${'10ms'}
      ${50}        | ${'50ms'}
      ${100}       | ${'100ms'}
    `('should wait for $description', async ({ milliseconds }) => {
      // arrange
      const start = Date.now();
      // act
      await sleep(milliseconds);
      const end = Date.now();
      const elapsed = end - start;

      // assert
      // timers can fire 1-2ms early because of system timer resolution habit-hooks-disable non-essential-comment
      expect(elapsed).toBeGreaterThanOrEqual(milliseconds - EARLY_FIRE_TOLERANCE_MS);
      expect(elapsed).toBeLessThan(milliseconds + EXECUTION_TOLERANCE_MS);
    });

    it('should return a promise', () => {
      // act
      const result = sleep(10);
      // assert
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('yieldToMainThread', () => {
    it('should return a promise that resolves', async () => {
      // act
      const result = yieldToMainThread();
      // assert
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });
  });
});
