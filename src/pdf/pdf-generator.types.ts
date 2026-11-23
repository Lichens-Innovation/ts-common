import { format } from 'date-fns';
import type { ImageCompression, ImageFormat, jsPDF, jsPDFOptions } from 'jspdf';

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

export interface CellStyle {
  cellWidth?: number;
  halign?: TableCellHalign;
  valign?: TableCellValign;
  fontStyle?: FontStyle;
  fillColor?: FillColorRgbTuple;
}

export interface ComputeTableMarginsArgs {
  tableWidth: number;
  tableAlign: TableCellHalign;
}

export type CellValue = string | number;

export interface TableCellDef {
  content: string | string[] | number;
  rowSpan?: number;
  colSpan?: number;
}

export type TableCellInput = CellValue | TableCellDef;

export interface AddTableArgs {
  body: TableCellInput[][];
  head?: CellValue[];
  /** Defaults to the generator's currentY. habit-hooks-disable non-essential-comment */
  startY?: number;

  /** In doc units (inches); defaults to equal columns spanning the available width. habit-hooks-disable non-essential-comment */
  columnWidths?: number[];
  /** Merged over the generated `cellWidth` of each column. habit-hooks-disable non-essential-comment */
  columnStyles?: Record<number, CellStyle>;

  /** Outer table border (default true). habit-hooks-disable non-essential-comment */
  drawLineForTable?: boolean;
  /** Cell borders (default true). habit-hooks-disable non-essential-comment */
  drawLineForCells?: boolean;
  /** In doc units (inches) (default 0.005). habit-hooks-disable non-essential-comment */
  lineWidth?: number;
  /** Grayscale: 0 = black, 200 = light gray, 255 = white (default 0). habit-hooks-disable non-essential-comment */
  lineColor?: number;
  /** In doc units (inches) (default 0.05). habit-hooks-disable non-essential-comment */
  cellPadding?: number;
  /** Placement within the available width (default 'left'). habit-hooks-disable non-essential-comment */
  tableAlign?: TableCellHalign;
}

export interface AddImageArgs {
  dataUri: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Default 'PNG'. habit-hooks-disable non-essential-comment */
  format?: ImageFormat;
  /** Default 'MEDIUM'; 'NONE' embeds raw uncompressed pixel data. habit-hooks-disable non-essential-comment */
  compression?: ImageCompression;
}
