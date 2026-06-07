import { describe, expect, it } from 'vitest';
import { escapeHtml, unescapeHtml } from './html.utils';

describe('html.utils', () => {
  describe('unescapeHtml', () => {
    it.each`
      input       | expected
      ${'&amp;'}  | ${'&'}
      ${'&lt;'}   | ${'<'}
      ${'&gt;'}   | ${'>'}
      ${'&quot;'} | ${'"'}
      ${'&#39;'}  | ${"'"}
      ${'&#x27;'} | ${"'"}
    `('unescapes named and numeric entities ($input → $expected)', ({ input, expected }) => {
      expect(unescapeHtml(input)).toBe(expected);
    });

    it('returns empty string for empty input', () => {
      expect(unescapeHtml('')).toBe('');
    });

    it('leaves plain text unchanged', () => {
      expect(unescapeHtml('hello world')).toBe('hello world');
    });

    it('unescapes multiple entities in one string', () => {
      expect(unescapeHtml('a &amp; b &lt; c &gt; d')).toBe('a & b < c > d');
    });

    it('leaves entities not handled by the pattern unchanged', () => {
      expect(unescapeHtml('&nbsp;')).toBe('&nbsp;');
    });

    it('round-trips with escapeHtml for typical user content', () => {
      const original = 'Label: <tag attr="v"> & \'mixed\'';
      expect(unescapeHtml(escapeHtml(original))).toBe(original);
    });
  });

  describe('escapeHtml', () => {
    it('returns empty string for empty input', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('leaves plain text unchanged', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
    });

    it('escapes all special characters in one string', () => {
      expect(escapeHtml('<a href="x">y & z\'s</a>')).toBe(
        '&lt;a href=&quot;x&quot;&gt;y &amp; z&#39;s&lt;/a&gt;',
      );
    });
  });
});
