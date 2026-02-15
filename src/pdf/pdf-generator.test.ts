import { describe, expect, it, vi } from 'vitest';
import { PdfGenerator } from './pdf-generator';

describe('PdfGenerator', () => {
  describe('constructor and getters', () => {
    it('uses default options when none provided', () => {
      const gen = new PdfGenerator();
      expect(gen.filename).toBe('report.pdf');
      expect(gen.margin).toBe(0.5);
      expect(gen.theme.fontSize.tiny).toBe(7);
      expect(gen.font).toBe('helvetica');
    });

    it('merges custom options with defaults', () => {
      const gen = new PdfGenerator({
        filename: 'custom.pdf',
        margin: 1,
        hasFooter: false,
      });
      expect(gen.filename).toBe('custom.pdf');
      expect(gen.margin).toBe(1);
      expect(gen.theme.fontSize.tiny).toBe(7);
    });

    it('exposes page dimensions', () => {
      const gen = new PdfGenerator();
      expect(gen.pageWidth).toBeGreaterThan(0);
      expect(gen.pageHeight).toBeGreaterThan(0);
      expect(gen.pageSize.width).toBe(gen.pageWidth);
      expect(gen.pageSize.height).toBe(gen.pageHeight);
    });

    it('availableWidth is pageWidth minus twice margin', () => {
      const gen = new PdfGenerator({ margin: 0.5 });
      expect(gen.availableWidth).toBe(gen.pageWidth - 2 * 0.5);
    });

    it('availableHeight is pageHeight minus twice margin', () => {
      const gen = new PdfGenerator({ margin: 0.5 });
      expect(gen.availableHeight).toBe(gen.pageHeight - 2 * 0.5);
    });

    it('footerHeight is 0 when hasFooter is false', () => {
      const gen = new PdfGenerator({ hasFooter: false });
      expect(gen.footerHeight).toBe(0);
    });

    it('footerHeight is positive when hasFooter is true', () => {
      const gen = new PdfGenerator({ hasFooter: true });
      expect(gen.footerHeight).toBeGreaterThan(0);
    });

    it('footerFontSizePoints returns theme tiny fontSize', () => {
      const gen = new PdfGenerator();
      expect(gen.footerFontSizePoints).toBe(7);
    });
  });

  describe('currentY and layout', () => {
    it('currentY starts at margin', () => {
      const gen = new PdfGenerator({ margin: 0.5 });
      expect(gen.currentY).toBe(0.5);
    });

    it('setCurrentY updates currentY', () => {
      const gen = new PdfGenerator();
      gen.setCurrentY(2.5);
      expect(gen.currentY).toBe(2.5);
    });

    it('addVerticalGap increases currentY', () => {
      const gen = new PdfGenerator();
      const initial = gen.currentY;
      gen.addVerticalGap(0.25);
      expect(gen.currentY).toBe(initial + 0.25);
    });
  });

  describe('addTable', () => {
    it('returns startY and does not advance currentY when body is empty', () => {
      const gen = new PdfGenerator();
      const startY = gen.currentY;
      const result = gen.addTable({ body: [] });
      expect(result).toBe(startY);
      expect(gen.currentY).toBe(startY);
    });

    it('advances currentY when body has rows', () => {
      const gen = new PdfGenerator();
      const startY = gen.currentY;
      gen.addTable({
        body: [['A', 'B'], ['1', '2']],
      });
      expect(gen.currentY).toBeGreaterThan(startY);
    });

    it('accepts optional head row', () => {
      const gen = new PdfGenerator();
      gen.addTable({
        head: ['Col1', 'Col2'],
        body: [['a', 'b']],
      });
      expect(gen.currentY).toBeGreaterThan(gen.margin);
    });
  });

  describe('addImage', () => {
    it('does not change currentY', () => {
      const gen = new PdfGenerator();
      const doc = gen.getDoc();
      vi.spyOn(doc, 'addImage').mockImplementation(() => {});
      const before = gen.currentY;
      gen.addImage({
        dataUri: 'data:image/png;base64,placeholder',
        x: gen.margin,
        y: before,
        width: 1,
        height: 1,
      });
      expect(gen.currentY).toBe(before);
    });
  });

  describe('addFullPagePNG', () => {
    it('advances currentY after adding image', () => {
      const gen = new PdfGenerator();
      const doc = gen.getDoc();
      vi.spyOn(doc, 'addImage').mockImplementation(() => {});
      const before = gen.currentY;
      gen.addFullPagePNG('data:image/png;base64,placeholder', 16 / 9);
      expect(gen.currentY).toBeGreaterThan(before);
    });
  });

  describe('addPage', () => {
    it('increases page count', () => {
      const gen = new PdfGenerator();
      const doc = gen.getDoc();
      expect(doc.getNumberOfPages()).toBe(1);
      gen.addPage();
      expect(doc.getNumberOfPages()).toBe(2);
    });
  });

  describe('getDoc', () => {
    it('returns the jsPDF instance', () => {
      const gen = new PdfGenerator();
      const doc = gen.getDoc();
      expect(doc).toBeDefined();
      expect(typeof doc.getNumberOfPages).toBe('function');
    });
  });

  describe('checkTableOverflow', () => {
    it('does not warn when column sum is within available width', () => {
      const gen = new PdfGenerator();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      gen.checkTableOverflow([gen.availableWidth / 2, gen.availableWidth / 2]);
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('warns when column sum exceeds available width', () => {
      const gen = new PdfGenerator();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      gen.checkTableOverflow([gen.availableWidth, gen.availableWidth]);
      expect(warn).toHaveBeenCalledWith(
        '[checkTableOverflow] table overflow',
        expect.objectContaining({
          availableWidth: gen.availableWidth,
          computedSum: gen.availableWidth * 2,
        })
      );
      warn.mockRestore();
    });
  });

  describe('renderFooters', () => {
    it('warns and returns early when hasFooter is false', () => {
      const gen = new PdfGenerator({ hasFooter: false });
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      gen.renderFooters();
      expect(warn).toHaveBeenCalledWith('[renderFooters] Footer is disabled');
      warn.mockRestore();
    });

    it('does not throw when hasFooter is true', () => {
      const gen = new PdfGenerator({ hasFooter: true });
      expect(() => gen.renderFooters()).not.toThrow();
    });
  });

  describe('font setter', () => {
    it('updates font', () => {
      const gen = new PdfGenerator();
      gen.font = 'times';
      expect(gen.font).toBe('times');
    });
  });
});
