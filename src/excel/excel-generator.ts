import ExcelJS from "exceljs";
import type { CellStyle, CellValue } from "./excel-generator.types";

interface AddCellArgs {
  row: number;
  col: number;
  value: CellValue;
  style?: CellStyle;
}

interface AddRowArgs {
  values: CellValue[];
  styles?: CellStyle[];
}

export class WorksheetBuilder {
  private worksheet: ExcelJS.Worksheet;
  private currentRow: number;
  private defaultRowStyles: CellStyle[];

  constructor(worksheet: ExcelJS.Worksheet) {
    this.worksheet = worksheet;
    this.currentRow = 1; // ExcelJS uses 1-based indexing
    this.defaultRowStyles = [];
  }

  /** Returns the current row index (1-based). */
  get rowCount(): number {
    return this.currentRow;
  }

  addCell({ row, col, value, style }: AddCellArgs): void {
    const cell = this.worksheet.getCell(row + 1, col + 1); // Convert to 1-based
    cell.value = value ?? "";

    if (style) {
      this.applyStyle(cell, style);
    }
  }

  addRow({ values, styles }: AddRowArgs): void {
    const stylesToUse = styles ?? this.defaultRowStyles;
    const row = this.worksheet.addRow(values);

    // Apply styles to each cell in the row
    for (let col = 0; col < values.length; col++) {
      const style = stylesToUse[col];
      if (style) {
        const cell = row.getCell(col + 1); // ExcelJS uses 1-based indexing
        this.applyStyle(cell, style);
      }
    }

    this.currentRow++;
  }

  setDefaultRowStyles(styles: CellStyle[]): void {
    this.defaultRowStyles = styles;
  }

  addEmptyRow(): void {
    this.worksheet.addRow([]);
    this.currentRow++;
  }

  setColumnWidths(columnWidths: number[]): void {
    this.worksheet.columns = columnWidths.map((width) => ({ width }));
  }

  getWorksheet(): ExcelJS.Worksheet {
    return this.worksheet;
  }

  private applyStyle(cell: ExcelJS.Cell, style: CellStyle): void {
    if (style.font) {
      cell.font = { ...cell.font, ...style.font };
    }

    if (style.fill) {
      cell.fill = style.fill as ExcelJS.Fill;
    }

    if (style.alignment) {
      cell.alignment = { ...cell.alignment, ...style.alignment };
    }

    if (style.border) {
      cell.border = { ...cell.border, ...style.border };
    }

    if (style.numFmt) {
      cell.numFmt = style.numFmt;
    }
  }
}
