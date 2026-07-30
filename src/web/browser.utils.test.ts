import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUrl } from './browser.utils';

describe('Browser utilities', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: { href: 'https://example.com/path' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getCurrentUrl', () => {
    it('returns window.location.href when window is defined', () => {
      // act
      const result = getCurrentUrl();
      // assert
      expect(result).toBe('https://example.com/path');
    });

    it('returns empty string when window is undefined', () => {
      // arrange
      vi.stubGlobal('window', undefined);
      // act
      const result = getCurrentUrl();
      // assert
      expect(result).toBe('');
    });
  });
});
