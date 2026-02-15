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
      expect(getCurrentUrl()).toBe('https://example.com/path');
    });

    it('returns empty string when window is undefined', () => {
      vi.stubGlobal('window', undefined);
      expect(getCurrentUrl()).toBe('');
    });
  });
});
