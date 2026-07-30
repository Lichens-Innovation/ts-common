import { describe, expect, it } from 'vitest';
import { sleep } from './thread.utils';

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
      // Allow some tolerance for timing (timers can fire 1-2ms early due to system timer resolution)
      expect(elapsed).toBeGreaterThanOrEqual(milliseconds - 2);
      // But shouldn't be too much more (allow 50ms tolerance for test execution)
      expect(elapsed).toBeLessThan(milliseconds + 50);
    });

    it('should return a promise', () => {
      // act
      const result = sleep(10);
      // assert
      expect(result).toBeInstanceOf(Promise);
    });
  });
});

