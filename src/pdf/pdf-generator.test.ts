import { describe, expect, it, vi } from 'vitest';
import { autoTable } from 'jspdf-autotable';
import { PdfGenerator } from './pdf-generator';

vi.mock('jspdf-autotable', async () => {
  const actual = await vi.importActual<typeof import('jspdf-autotable')>('jspdf-autotable');
  return { ...actual, autoTable: vi.fn(actual.autoTable) };
});

describe('PdfGenerator', () => {
  describe('constructor and getters', () => {
    it('uses default options when none provided', () => {
      // Act
      const gen = new PdfGenerator();

      // Assert
      expect(gen.filename).toBe('report.pdf');
      expect(gen.margin).toBe(0.5);
      expect(gen.theme.fontSize.tiny).toBe(7);
      expect(gen.font).toBe('helvetica');
    });

    it('merges custom options with defaults', () => {
      // Arrange
      const options = { filename: 'custom.pdf', margin: 1, hasFooter: false };

      // Act
      const gen = new PdfGenerator(options);

      // Assert
      expect(gen.filename).toBe('custom.pdf');
      expect(gen.margin).toBe(1);
      expect(gen.theme.fontSize.tiny).toBe(7);
    });

    it('exposes page dimensions', () => {
      // Act
      const gen = new PdfGenerator();

      // Assert
      expect(gen.pageWidth).toBeGreaterThan(0);
      expect(gen.pageHeight).toBeGreaterThan(0);
      expect(gen.pageSize.width).toBe(gen.pageWidth);
      expect(gen.pageSize.height).toBe(gen.pageHeight);
    });

    it('availableWidth is pageWidth minus twice margin', () => {
      // Act
      const gen = new PdfGenerator({ margin: 0.5 });

      // Assert
      expect(gen.availableWidth).toBe(gen.pageWidth - 2 * 0.5);
    });

    it('availableHeight is pageHeight minus twice margin', () => {
      // Act
      const gen = new PdfGenerator({ margin: 0.5 });

      // Assert
      expect(gen.availableHeight).toBe(gen.pageHeight - 2 * 0.5);
    });

    it('footerHeight is 0 when hasFooter is false', () => {
      // Act
      const gen = new PdfGenerator({ hasFooter: false });

      // Assert
      expect(gen.footerHeight).toBe(0);
    });

    it('footerHeight is positive when hasFooter is true', () => {
      // Act
      const gen = new PdfGenerator({ hasFooter: true });

      // Assert
      expect(gen.footerHeight).toBeGreaterThan(0);
    });

    it('footerFontSizePoints returns theme tiny fontSize', () => {
      // Act
      const gen = new PdfGenerator();

      // Assert
      expect(gen.footerFontSizePoints).toBe(7);
    });
  });

  describe('currentY and layout', () => {
    it('currentY starts at margin', () => {
      // Act
      const gen = new PdfGenerator({ margin: 0.5 });

      // Assert
      expect(gen.currentY).toBe(0.5);
    });

    it('setCurrentY updates currentY', () => {
      // Arrange
      const gen = new PdfGenerator();

      // Act
      gen.setCurrentY(2.5);

      // Assert
      expect(gen.currentY).toBe(2.5);
    });

    it('addVerticalGap increases currentY', () => {
      // Arrange
      const gen = new PdfGenerator();
      const initial = gen.currentY;

      // Act
      gen.addVerticalGap(0.25);

      // Assert
      expect(gen.currentY).toBe(initial + 0.25);
    });
  });

  describe('addTable', () => {
    it('returns startY and does not advance currentY when body is empty', () => {
      // Arrange
      const gen = new PdfGenerator();
      const startY = gen.currentY;

      // Act
      const result = gen.addTable({ body: [] });

      // Assert
      expect(result).toBe(startY);
      expect(gen.currentY).toBe(startY);
    });

    it('advances currentY when body has rows', () => {
      // Arrange
      const gen = new PdfGenerator();
      const startY = gen.currentY;

      // Act
      gen.addTable({
        body: [['A', 'B'], ['1', '2']],
      });

      // Assert
      expect(gen.currentY).toBeGreaterThan(startY);
    });

    it('accepts optional head row', () => {
      // Arrange
      const gen = new PdfGenerator();

      // Act
      gen.addTable({
        head: ['Col1', 'Col2'],
        body: [['a', 'b']],
      });

      // Assert
      expect(gen.currentY).toBeGreaterThan(gen.margin);
    });

    describe('tableAlign', () => {
      it('defaults to left — margin.left/right both equal generator margin', () => {
        // Arrange
        const gen = new PdfGenerator();

        // Act
        gen.addTable({ body: [['a', 'b']] });

        // Assert
        const lastCall = vi.mocked(autoTable).mock.calls.at(-1)?.[1];
        expect(lastCall?.margin).toEqual({ left: gen.margin, right: gen.margin });
      });

      it('centers a table narrower than availableWidth when tableAlign is center', () => {
        // Arrange
        const gen = new PdfGenerator();
        const columnWidths = [gen.availableWidth / 4, gen.availableWidth / 4];

        // Act
        gen.addTable({ body: [['a', 'b']], columnWidths, tableAlign: 'center' });

        // Assert
        const tableWidth = columnWidths[0] + columnWidths[1];
        const halfLeftover = (gen.availableWidth - tableWidth) / 2;
        const lastCall = vi.mocked(autoTable).mock.calls.at(-1)?.[1];
        expect(lastCall?.margin).toEqual({ left: gen.margin + halfLeftover, right: gen.margin + halfLeftover });
      });

      it('right-aligns a table narrower than availableWidth when tableAlign is right', () => {
        // Arrange
        const gen = new PdfGenerator();
        const columnWidths = [gen.availableWidth / 4, gen.availableWidth / 4];

        // Act
        gen.addTable({ body: [['a', 'b']], columnWidths, tableAlign: 'right' });

        // Assert
        const tableWidth = columnWidths[0] + columnWidths[1];
        const leftover = gen.availableWidth - tableWidth;
        const lastCall = vi.mocked(autoTable).mock.calls.at(-1)?.[1];
        expect(lastCall?.margin).toEqual({ left: gen.margin + leftover, right: gen.margin });
      });

      it('does not warn or throw when tableAlign is omitted and columnWidths spans full width', () => {
        // Arrange
        const gen = new PdfGenerator();
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Act
        const act = () => gen.addTable({ body: [['a', 'b']], tableAlign: 'center' });

        // Assert
        expect(act).not.toThrow();
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
      });
    });
  });

  describe('addImage', () => {
    it('does not change currentY', () => {
      // Arrange
      const gen = new PdfGenerator();
      const doc = gen.getDoc();
      vi.spyOn(doc, 'addImage').mockImplementation(() => {});
      const before = gen.currentY;

      // Act
      gen.addImage({
        dataUri: 'data:image/png;base64,placeholder',
        x: gen.margin,
        y: before,
        width: 1,
        height: 1,
      });

      // Assert
      expect(gen.currentY).toBe(before);
    });
  });

  describe('addFullPagePNG', () => {
    it('advances currentY after adding image', () => {
      // Arrange
      const gen = new PdfGenerator();
      const doc = gen.getDoc();
      vi.spyOn(doc, 'addImage').mockImplementation(() => {});
      const before = gen.currentY;

      // Act
      gen.addFullPagePNG('data:image/png;base64,placeholder', 16 / 9);

      // Assert
      expect(gen.currentY).toBeGreaterThan(before);
    });
  });

  describe('addPage', () => {
    it('increases page count', () => {
      // Arrange
      const gen = new PdfGenerator();
      const doc = gen.getDoc();
      expect(doc.getNumberOfPages()).toBe(1);

      // Act
      gen.addPage();

      // Assert
      expect(doc.getNumberOfPages()).toBe(2);
    });
  });

  describe('getDoc', () => {
    it('returns the jsPDF instance', () => {
      // Arrange
      const gen = new PdfGenerator();

      // Act
      const doc = gen.getDoc();

      // Assert
      expect(doc).toBeDefined();
      expect(typeof doc.getNumberOfPages).toBe('function');
    });
  });

  describe('checkTableOverflow', () => {
    it('does not warn when column sum is within available width', () => {
      // Arrange
      const gen = new PdfGenerator();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Act
      gen.checkTableOverflow([gen.availableWidth / 2, gen.availableWidth / 2]);

      // Assert
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('warns when column sum exceeds available width', () => {
      // Arrange
      const gen = new PdfGenerator();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Act
      gen.checkTableOverflow([gen.availableWidth, gen.availableWidth]);

      // Assert
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
      // Arrange
      const gen = new PdfGenerator({ hasFooter: false });
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Act
      gen.renderFooters();

      // Assert
      expect(warn).toHaveBeenCalledWith('[renderFooters] Footer is disabled');
      warn.mockRestore();
    });

    it('does not throw when hasFooter is true', () => {
      // Arrange
      const gen = new PdfGenerator({ hasFooter: true });
      const act = () => gen.renderFooters();

      // Act & Assert
      expect(act).not.toThrow();
    });
  });

  describe('font setter', () => {
    it('updates font', () => {
      // Arrange
      const gen = new PdfGenerator();

      // Act
      gen.font = 'times';

      // Assert
      expect(gen.font).toBe('times');
    });
  });
});
