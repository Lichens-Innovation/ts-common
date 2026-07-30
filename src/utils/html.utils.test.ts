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
      // act
      const result = unescapeHtml(input);
      // assert
      expect(result).toBe(expected);
    });

    it('returns empty string for empty input', () => {
      // act
      const result = unescapeHtml('');
      // assert
      expect(result).toBe('');
    });

    it('leaves plain text unchanged', () => {
      // act
      const result = unescapeHtml('hello world');
      // assert
      expect(result).toBe('hello world');
    });

    it('unescapes multiple entities in one string', () => {
      // act
      const result = unescapeHtml('a &amp; b &lt; c &gt; d');
      // assert
      expect(result).toBe('a & b < c > d');
    });

    it('leaves entities not handled by the pattern unchanged', () => {
      // act
      const result = unescapeHtml('&nbsp;');
      // assert
      expect(result).toBe('&nbsp;');
    });

    it('round-trips with escapeHtml for typical user content', () => {
      // arrange
      const original = 'Label: <tag attr="v"> & \'mixed\'';
      // act
      const roundTripped = unescapeHtml(escapeHtml(original));
      // assert
      expect(roundTripped).toBe(original);
    });
  });

  describe('escapeHtml', () => {
    it('returns empty string for empty input', () => {
      // act
      const result = escapeHtml('');
      // assert
      expect(result).toBe('');
    });

    it('leaves plain text unchanged', () => {
      // act
      const result = escapeHtml('hello world');
      // assert
      expect(result).toBe('hello world');
    });

    it('escapes all special characters in one string', () => {
      // act
      const result = escapeHtml('<a href="x">y & z\'s</a>');
      // assert
      expect(result).toBe(
        '&lt;a href=&quot;x&quot;&gt;y &amp; z&#39;s&lt;/a&gt;',
      );
    });
  });
});
