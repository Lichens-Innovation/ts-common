import ExcelJS from 'exceljs';
import { getMimeType } from '../mime';
import { isNullish } from '../utils';
import type { CellHyperlink, CellValue, ColumnMetadata } from './excel-generator.types';

/**
 * Sanitizes a worksheet title to comply with Excel's limitations.
 *
 * Excel enforces strict rules for worksheet names:
 * - Maximum length of 31 characters (legacy limitation from older Excel versions)
 * - Certain characters are reserved for special purposes and cannot be used:
 *   - `:` (colon) - used in cell range references (e.g., A1:B2)
 *   - `/` (forward slash) - used in file paths
 *   - `\` (backslash) - used in file paths and escape sequences
 *   - `?` (question mark) - used as wildcard in formulas
 *   - `*` (asterisk) - used as wildcard in formulas
 *   - `[` and `]` (square brackets) - used in external references (e.g., [Book1.xlsx]Sheet1!A1)
 *
 * This function removes invalid characters and truncates the title to 31 characters
 * to ensure compatibility with Excel's file format specifications.
 *
 * @param title - The original worksheet title to sanitize
 * @returns A sanitized title that complies with Excel's naming rules
 */
export const sanitizeWorksheetTitle = (title: string): string => {
  const MAX_LENGTH = 31;
  const INVALID_CHARS = /[:/\\?*[\]]/g;

  return title.trim().replace(INVALID_CHARS, '').slice(0, MAX_LENGTH);
};

interface ToSafeCellValueArgs {
  value: CellValue;
  valueType: ColumnMetadata['valueType'];
}

const toSafeCellValue = ({ value, valueType }: ToSafeCellValueArgs): CellValue => {
  if (!isNullish(value) && valueType === 'number') {
    const numValue = typeof value === 'number' ? value : Number(value);
    return isNaN(numValue) ? value : numValue;
  }

  return value ?? '';
};

interface ToSafeCellValuesArgs {
  headers: string[];
  rowData: Record<string, CellValue>;
  columnsMetadata?: Record<string, ColumnMetadata>;
}

const toSafeCellValues = ({ headers, rowData, columnsMetadata }: ToSafeCellValuesArgs): CellValue[] => {
  return headers.map((header) => {
    const value = rowData[header];
    const metadata = columnsMetadata?.[header];
    const valueType = metadata?.valueType ?? 'auto';
    return toSafeCellValue({ value, valueType });
  });
};

interface ApplyTextFormattingArgs {
  row: ExcelJS.Row;
  headers: string[];
  columnsMetadata?: Record<string, ColumnMetadata>;
}

const applyTextFormatting = ({ row, headers, columnsMetadata }: ApplyTextFormattingArgs): void => {
  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    const header = headers[colIndex];
    const metadata = columnsMetadata?.[header];
    const valueType = metadata?.valueType ?? 'auto';

    if (valueType === 'text') {
      const cell = row.getCell(colIndex + 1);
      cell.numFmt = '@';
    }
  }
};

const applyHeaderStyles = (headerRow: ExcelJS.Row): void => {
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  headerRow.alignment = { wrapText: true, vertical: 'top' };
};

interface SetupHeaderFrozenRowArgs {
  worksheet: ExcelJS.Worksheet;
  headers: string[];
}

const setupHeaderFrozenRow = ({ worksheet, headers }: SetupHeaderFrozenRowArgs): void => {
  const headerRow = worksheet.addRow(headers);
  applyHeaderStyles(headerRow);
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
};

interface ApplyDataRowStylesArgs {
  worksheet: ExcelJS.Worksheet;
  startRowIndex: number;
  endRowIndex: number;
}

const applyDataRowStyles = ({ worksheet, startRowIndex, endRowIndex }: ApplyDataRowStylesArgs): void => {
  for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    row.alignment = { wrapText: false, vertical: 'top' };
  }
};

interface SetColumnWidthsArgs {
  worksheet: ExcelJS.Worksheet;
  headers: string[];
  columnsMetadata: Record<string, ColumnMetadata>;
}

const setColumnWidths = ({ worksheet, headers, columnsMetadata }: SetColumnWidthsArgs): void => {
  worksheet.columns = headers.map((header) => {
    const metadata = columnsMetadata[header];
    return metadata ? { width: metadata.width } : {};
  });
};

interface AddDataRowsArgs {
  worksheet: ExcelJS.Worksheet;
  headers: string[];
  columnsMetadata: Record<string, ColumnMetadata>;
  data: Record<string, CellValue>[];
}

export const isCellHyperlink = (value: CellValue): value is CellHyperlink =>
  typeof value === 'object' && value !== null && typeof value.hyperlink === 'string';

// The colour and underline Excel gives a link it creates itself.
const HYPERLINK_FONT: Partial<ExcelJS.Font> = { color: { argb: 'FF0563C1' }, underline: true };

const applyHyperlinkStyles = (row: ExcelJS.Row, values: CellValue[]): void => {
  values.forEach((value, colIndex) => {
    if (isCellHyperlink(value)) row.getCell(colIndex + 1).font = HYPERLINK_FONT;
  });
};

const addDataRows = ({ worksheet, headers, columnsMetadata, data }: AddDataRowsArgs): void => {
  for (const rowData of data) {
    const safeCellValues = toSafeCellValues({ headers, rowData, columnsMetadata });
    const row = worksheet.addRow(safeCellValues);
    applyTextFormatting({ row, headers, columnsMetadata });
    applyHyperlinkStyles(row, safeCellValues);
  }

  applyDataRowStyles({ worksheet, startRowIndex: 2, endRowIndex: data.length + 1 });
};

/**
 * Sanitized worksheet titles, made unique the way Excel compares them (ignoring case): a workbook
 * holding two sheets of the same name is refused when opened. A repeat gets a ` (n)` suffix, the
 * title shortened so the suffix still fits in Excel's 31 characters.
 */
export const uniqueWorksheetTitles = (titles: string[]): string[] => {
  const MAX_LENGTH = 31;
  const taken = new Set<string>();

  return titles.map((title, index) => {
    const base = sanitizeWorksheetTitle(title) || `Sheet${index + 1}`;
    let candidate = base;
    for (let n = 2; taken.has(candidate.toLowerCase()); n++) {
      const suffix = ` (${n})`;
      candidate = `${base.slice(0, MAX_LENGTH - suffix.length).trimEnd()}${suffix}`;
    }
    taken.add(candidate.toLowerCase());
    return candidate;
  });
};

export interface ExcelSheetArgs {
  worksheetTitle: string;
  data: Record<string, CellValue>[];
  /**
   * Metadata for columns, keyed by column name (translated header name).
   * If not provided, columns will use default width and auto-detect value types.
   */
  columnsMetadata: Record<string, ColumnMetadata>;
}

type GenerateExcelBlobArgs = ExcelSheetArgs;

interface GenerateExcelWorkbookBlobArgs {
  /** One worksheet each, in this order. */
  sheets: ExcelSheetArgs[];
}

export const generateExcelWorkbookBlob = async ({ sheets }: GenerateExcelWorkbookBlobArgs): Promise<Blob> => {
  if (sheets.length === 0 || sheets.some((sheet) => sheet.data.length === 0)) {
    throw new Error('No data to export');
  }

  const workbook = new ExcelJS.Workbook();
  const titles = uniqueWorksheetTitles(sheets.map((sheet) => sheet.worksheetTitle));

  sheets.forEach(({ data, columnsMetadata }, index) => {
    const headers = Object.keys(data[0]);
    const worksheet = workbook.addWorksheet(titles[index]);

    setupHeaderFrozenRow({ worksheet, headers });
    addDataRows({ worksheet, headers, columnsMetadata, data });
    setColumnWidths({ worksheet, headers, columnsMetadata });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: getMimeType('xlsx') });
};

export const generateExcelBlob = async (args: GenerateExcelBlobArgs): Promise<Blob> =>
  generateExcelWorkbookBlob({ sheets: [args] });
