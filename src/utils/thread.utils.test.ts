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
      const start = Date.now();
      await sleep(milliseconds);
      const end = Date.now();
      const elapsed = end - start;

      // Allow some tolerance for timing (at least the specified time, but may be slightly more)
      expect(elapsed).toBeGreaterThanOrEqual(milliseconds);
      // But shouldn't be too much more (allow 50ms tolerance for test execution)
      expect(elapsed).toBeLessThan(milliseconds + 50);
    });

    it('should return a promise', () => {
      const result = sleep(10);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});

