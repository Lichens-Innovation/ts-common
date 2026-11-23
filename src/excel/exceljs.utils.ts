import ExcelJS from 'exceljs';
import { getMimeType } from '../mime/mime.utils';
import { isNullish } from '../utils/runtime/types.utils';
import { isBlank } from '../utils/string/string.utils';
import type { CellHyperlink, CellValue, ColumnMetadata } from './excel-generator.types';

/** habit-hooks-disable non-essential-comment
 * Excel rejects worksheet names longer than 31 characters or containing any of `: / \ ? * [ ]`
 * (reserved for range references, paths, wildcards and external references).
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

// The colour and underline Excel gives a link it creates itself. habit-hooks-disable non-essential-comment
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

/** habit-hooks-disable non-essential-comment
 * Sanitized worksheet titles, made unique the way Excel compares them (ignoring case): a workbook
 * holding two sheets of the same name is refused when opened. A repeat gets a ` (n)` suffix, the
 * title shortened so the suffix still fits in Excel's 31 characters.
 */
export const uniqueWorksheetTitles = (titles: string[]): string[] => {
  const MAX_LENGTH = 31;
  const taken = new Set<string>();

  return titles.map((title, index) => {
    const sanitized = sanitizeWorksheetTitle(title);
    const base = isBlank(sanitized) ? `Sheet${index + 1}` : sanitized;
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
  /** habit-hooks-disable non-essential-comment
   * Keyed by column name (the translated header). Columns without an entry keep the default width
   * and the 'auto' value type.
   */
  columnsMetadata: Record<string, ColumnMetadata>;
}

type GenerateExcelBlobArgs = ExcelSheetArgs;

interface GenerateExcelWorkbookBlobArgs {
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
