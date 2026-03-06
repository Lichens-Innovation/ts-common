import { afterEach, describe, expect, it, vi } from 'vitest';
import { isRuntimeEnvNodeJs } from './runtime-env.utils';

describe('runtime-env utilities', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isRuntimeEnvNodeJs', () => {
    it('returns true when running in Node.js (no window, process.versions.node present)', () => {
      // Arrange & Act
      const result = isRuntimeEnvNodeJs();

      // Assert
      expect(result).toBe(true);
    });

    it('returns false when window is defined (browser-like env)', () => {
      // Arrange
      vi.stubGlobal('window', {});

      // Act
      const result = isRuntimeEnvNodeJs();

      // Assert
      expect(result).toBe(false);
    });

    it('returns false when process is undefined', () => {
      // Arrange
      vi.stubGlobal('process', undefined);

      // Act
      const result = isRuntimeEnvNodeJs();

      // Assert
      expect(result).toBe(false);
    });

    it('returns false when process.versions.node is nullish (e.g. Web Worker)', () => {
      // Arrange
      vi.stubGlobal('process', { versions: {} });

      // Act
      const result = isRuntimeEnvNodeJs();

      // Assert
      expect(result).toBe(false);
    });
  });
});
