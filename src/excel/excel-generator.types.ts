import type { Font, Fill, Alignment } from "exceljs";

export type CellValue = string | number | null | undefined;

export type VerticalAlignment = "top" | "middle" | "bottom";
export type HorizontalAlignment = "left" | "center" | "right";

export type ColumnValueType = "number" | "text" | "auto";

export interface ColumnMetadata {
  name: string;
  width: number;
  valueType?: ColumnValueType;
}

interface BorderSide {
  style?: "thin" | "medium" | "thick" | "dotted" | "dashed" | "double";
  color?: { argb: string };
}

/**
 * Type for ExcelJS cell borders.
 */
export interface CellBorder {
  top?: BorderSide;
  bottom?: BorderSide;
  left?: BorderSide;
  right?: BorderSide;
}

/**
 * Type for ExcelJS cell styles.
 * This is a simplified version of ExcelJS.Style that focuses on commonly used properties.
 */
export interface CellStyle {
  font?: Partial<Font>;
  fill?: Partial<Fill>;
  alignment?: Partial<Alignment>;
  border?: CellBorder;
  numFmt?: string;
}

/**
 * Helper type to convert RGB color string to ARGB format for ExcelJS.
 * ExcelJS uses ARGB format: "FFFFFFFF" where FF is alpha, then RGB.
 */
export type ArgbColor = { argb: string };

/**
 * Helper function to convert RGB color string to ARGB format.
 * @param rgb - RGB color string without # (e.g., "FFFFFF")
 * @returns ARGB color object (e.g., { argb: "FFFFFFFF" })
 */
export const rgbToArgb = (rgb: string): ArgbColor => {
  return { argb: `FF${rgb}` };
};
