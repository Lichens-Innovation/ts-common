import { describe, expect, it } from 'vitest';
import { convertSvgToDataUri, resizeSvgXml } from './image.utils';

describe('Image utilities', () => {
  describe('convertSvgToDataUri', () => {
    it('returns data URI with base64-encoded SVG', () => {
      // arrange
      const svgXml = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';
      // act
      const result = convertSvgToDataUri(svgXml);
      // assert
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(result.length).toBeGreaterThan(50);
    });

    it('produces decodable base64 content', () => {
      // arrange
      const svgXml = '<svg><path d="M0 0"/></svg>';
      // act
      const result = convertSvgToDataUri(svgXml);
      const base64 = result.replace(/^data:image\/svg\+xml;base64,/, '');
      const decoded = Buffer.from(base64, 'base64').toString('utf-8');
      // assert
      expect(decoded).toBe(svgXml);
    });

    it('handles empty string', () => {
      // act
      const result = convertSvgToDataUri('');
      // assert
      expect(result).toBe('data:image/svg+xml;base64,');
    });
  });

  describe('resizeSvgXml', () => {
    it('replaces existing width and height attributes', () => {
      // arrange
      const svgXml = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M0 0"/></svg>';
      // act
      const result = resizeSvgXml({ svgXml, targetWidth: 800, targetHeight: 600 });
      // assert
      expect(result).toContain('width="800"');
      expect(result).toContain('height="600"');
      expect(result).not.toContain('width="100"');
      expect(result).not.toContain('height="50"');
    });

    it('adds width and height when missing', () => {
      // arrange
      const svgXml = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>';
      // act
      const result = resizeSvgXml({ svgXml, targetWidth: 400, targetHeight: 300 });
      // assert
      expect(result).toContain('width="400"');
      expect(result).toContain('height="300"');
    });

    it('handles single-quoted attributes', () => {
      // arrange
      const svgXml = "<svg width='200' height='100'></svg>";
      // act
      const result = resizeSvgXml({ svgXml, targetWidth: 640, targetHeight: 480 });
      // assert
      expect(result).toContain('width="640"');
      expect(result).toContain('height="480"');
    });

    it('preserves rest of SVG content', () => {
      // arrange
      const svgXml = '<svg width="1" height="1"><g><circle cx="5" cy="5" r="3"/></g></svg>';
      // act
      const result = resizeSvgXml({ svgXml, targetWidth: 10, targetHeight: 10 });
      // assert
      expect(result).toContain('<g>');
      expect(result).toContain('<circle');
      expect(result).toContain('cx="5"');
    });
  });
});
