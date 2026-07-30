import { afterEach, describe, expect, it, vi } from 'vitest';
import { isRuntimeEnvNodeJs } from './runtime-env.utils';

describe('runtime-env utilities', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isRuntimeEnvNodeJs', () => {
    it('returns true when running in Node.js (no window, process.versions.node present)', () => {
      // act
      const result = isRuntimeEnvNodeJs();

      // assert
      expect(result).toBe(true);
    });

    it('returns false when window is defined (browser-like env)', () => {
      // arrange
      vi.stubGlobal('window', {});

      // act
      const result = isRuntimeEnvNodeJs();

      // assert
      expect(result).toBe(false);
    });

    it('returns false when process is undefined', () => {
      // arrange
      vi.stubGlobal('process', undefined);

      // act
      const result = isRuntimeEnvNodeJs();

      // assert
      expect(result).toBe(false);
    });

    it('returns false when process.versions.node is nullish (e.g. Web Worker)', () => {
      // arrange
      vi.stubGlobal('process', { versions: {} });

      // act
      const result = isRuntimeEnvNodeJs();

      // assert
      expect(result).toBe(false);
    });
  });
});
