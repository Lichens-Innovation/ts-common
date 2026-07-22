import { format } from 'date-fns';
import type { jsPDF, jsPDFOptions } from 'jspdf';

interface FontSize {
  title: number;
  header: number;
  normal: number;
  small: number;
  tiny: number;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface ThemeConfig {
  primaryColor: RgbColor;
  fontSize: FontSize;
}

export type PageSize = jsPDF['internal']['pageSize'];
export type PageOrientation = jsPDFOptions['orientation'];
export type PaperFormat = jsPDFOptions['format'];

export const DEFAULT_REPORT_FILENAME = 'report.pdf';
export const IMAGE_GAP = 0.5; // space in inches between image and footer

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: { r: 0, g: 0, b: 0 }, // black
  fontSize: {
    title: 16,
    header: 10,
    normal: 9,
    small: 8,
    tiny: 7,
  },
};

export interface FooterCellArgs {
  align: TableCellHalign;
  currentPage: number;
  totalPages: number;
}
export type FooterCellBuilder = (footerCellArgs: FooterCellArgs) => string;

export interface PdfOptions {
  orientation?: PageOrientation;
  paperFormat?: PaperFormat;
  hasFooter?: boolean;
  filename?: string;
  theme?: ThemeConfig;
  margin?: number;
  displayAvailableAreaRectangle?: boolean;
  footerCellBuilder?: FooterCellBuilder;
}

export const DEFAULT_FOOTER_CELL_BUILDER = ({ align, currentPage, totalPages }: FooterCellArgs): string => {
  if (align === 'left') return format(new Date(), 'yyyy-MM-dd HH:mm');
  if (align === 'center') return '';
  return `Page ${currentPage}/${totalPages}`;
};

export const DEFAULT_OPTIONS: Readonly<Required<PdfOptions>> = {
  orientation: 'portrait',
  paperFormat: 'letter',
  filename: DEFAULT_REPORT_FILENAME,
  theme: DEFAULT_THEME,
  margin: 0.5,
  displayAvailableAreaRectangle: false,
  hasFooter: true,
  footerCellBuilder: DEFAULT_FOOTER_CELL_BUILDER,
};

export const Gaps = {
  TINY: 0.02,
  SMALL: 0.04,
  MEDIUM: 0.08,
  LARGE: 0.16,
  X_LARGE: 0.32,
};

export const PdfColors: Record<string, FillColorRgbTuple> = {
  LIGHT_GRAY: [240, 240, 240],
};

export type TableCellHalign = 'left' | 'center' | 'right';
export type TableCellValign = 'top' | 'middle' | 'bottom';
export type FontStyle = 'normal' | 'bold';
export type FillColorRgbTuple = [number, number, number];

export type CellStyle = {
  cellWidth?: number;
  halign?: TableCellHalign;
  valign?: TableCellValign;
  fontStyle?: FontStyle;
  fillColor?: FillColorRgbTuple;
};

export type CellValue = string | number;

/** Cell with rowSpan/colSpan for merged cells (passed through to autoTable). */
export interface TableCellDef {
  content: string | string[] | number;
  rowSpan?: number;
  colSpan?: number;
}

export type TableCellInput = CellValue | TableCellDef;

/** Parameters for adding a table (generic API, no jspdf-autotable leak). */
export interface AddTableArgs {
  /** Each row is an array of cell values or cell defs (with rowSpan/colSpan). */
  body: TableCellInput[][];
  /** Optional header row (single row of cell values). */
  head?: CellValue[];
  /** Y position to start the table (uses generator currentY if omitted). */
  startY?: number;

  /** Optional column widths (in same units as doc, e.g. inches). Sum should match available width. */
  columnWidths?: number[];
  /** Optional per-column styles (e.g. halign, fontStyle). Merged with auto-generated cellWidth. */
  columnStyles?: Record<number, CellStyle>;

  /** Whether to draw the table outer border (default true). */
  drawLineForTable?: boolean;
  /** Whether to draw cell borders (default true). */
  drawLineForCells?: boolean;
  /** Table border line width (default 0.005). */
  lineWidth?: number;
  /** Table border color as a grayscale value: 0 = black, 200 = light gray, 255 = white (default 0). */
  lineColor?: number;
  /** Cell padding in doc units (inches) (default 0.05). */
  cellPadding?: number;
}

export interface AddImageArgs {
  dataUri: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
