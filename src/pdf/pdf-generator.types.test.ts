import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FOOTER_CELL_BUILDER,
  DEFAULT_OPTIONS,
  DEFAULT_REPORT_FILENAME,
  Gaps,
  IMAGE_GAP,
  PdfColors,
} from './pdf-generator.types';

describe('PDF generator types', () => {
  describe('constants', () => {
    it('DEFAULT_REPORT_FILENAME is report.pdf', () => {
      expect(DEFAULT_REPORT_FILENAME).toBe('report.pdf');
    });

    it('IMAGE_GAP is 0.5', () => {
      expect(IMAGE_GAP).toBe(0.5);
    });

    it('DEFAULT_OPTIONS has required fields', () => {
      expect(DEFAULT_OPTIONS.orientation).toBe('portrait');
      expect(DEFAULT_OPTIONS.paperFormat).toBe('letter');
      expect(DEFAULT_OPTIONS.filename).toBe(DEFAULT_REPORT_FILENAME);
      expect(DEFAULT_OPTIONS.margin).toBe(0.5);
      expect(DEFAULT_OPTIONS.hasFooter).toBe(true);
      expect(DEFAULT_OPTIONS.theme.fontSize.tiny).toBe(7);
    });

    it('Gaps has expected values', () => {
      expect(Gaps.TINY).toBe(0.02);
      expect(Gaps.SMALL).toBe(0.04);
      expect(Gaps.MEDIUM).toBe(0.08);
      expect(Gaps.LARGE).toBe(0.16);
      expect(Gaps.X_LARGE).toBe(0.32);
    });

    it('PdfColors has LIGHT_GRAY', () => {
      expect(PdfColors.LIGHT_GRAY).toEqual([240, 240, 240]);
    });
  });

  describe('DEFAULT_FOOTER_CELL_BUILDER', () => {
    it('returns date string for align "left"', () => {
      const result = DEFAULT_FOOTER_CELL_BUILDER({
        align: 'left',
        currentPage: 1,
        totalPages: 5,
      });
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    });

    it('returns empty string for align "center"', () => {
      const result = DEFAULT_FOOTER_CELL_BUILDER({
        align: 'center',
        currentPage: 2,
        totalPages: 10,
      });
      expect(result).toBe('');
    });

    it('returns "Page n/total" for align "right"', () => {
      const result = DEFAULT_FOOTER_CELL_BUILDER({
        align: 'right',
        currentPage: 3,
        totalPages: 10,
      });
      expect(result).toBe('Page 3/10');
    });
  });
});
