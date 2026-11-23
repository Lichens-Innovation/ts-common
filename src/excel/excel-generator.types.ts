import type { Font, Fill, Alignment } from 'exceljs';

/** A cell showing `text` that opens `hyperlink` when clicked in Excel. habit-hooks-disable non-essential-comment */
export interface CellHyperlink {
  text: string;
  hyperlink: string;
}

export type CellValue = string | number | CellHyperlink | null | undefined;

export type VerticalAlignment = 'top' | 'middle' | 'bottom';
export type HorizontalAlignment = 'left' | 'center' | 'right';

export type ColumnValueType = 'number' | 'text' | 'auto';

export interface ColumnMetadata {
  name: string;
  width: number;
  valueType?: ColumnValueType;
}

export interface ArgbColor {
  argb: string;
}

interface BorderSide {
  style?: 'thin' | 'medium' | 'thick' | 'dotted' | 'dashed' | 'double';
  color?: ArgbColor;
}

export interface CellBorder {
  top?: BorderSide;
  bottom?: BorderSide;
  left?: BorderSide;
  right?: BorderSide;
}

export interface CellStyle {
  font?: Partial<Font>;
  fill?: Partial<Fill>;
  alignment?: Partial<Alignment>;
  border?: CellBorder;
  numFmt?: string;
}

/** habit-hooks-disable non-essential-comment
 * Converts an RGB hex string without `#` (e.g. "FFFFFF") to the ARGB form ExcelJS expects,
 * with a fully opaque alpha prefix (e.g. { argb: "FFFFFFFF" }).
 */
export const rgbToArgb = (rgb: string): ArgbColor => {
  return { argb: `FF${rgb}` };
};
