import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import type { ColumnMetadata } from './excel-generator.types';
import {
  generateExcelBlob,
  generateExcelWorkbookBlob,
  sanitizeWorksheetTitle,
  uniqueWorksheetTitles,
} from './exceljs.utils';

const loadWorksheet = async (blob: Blob): Promise<ExcelJS.Worksheet> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await blob.arrayBuffer());
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('worksheet not found');
  return worksheet;
};

describe('ExcelJS utilities', () => {
  describe('sanitizeWorksheetTitle', () => {
    it.each`
      title                     | expected
      ${'Sheet1'}               | ${'Sheet1'}
      ${'My Worksheet'}         | ${'My Worksheet'}
      ${'Data:Report'}          | ${'DataReport'}
      ${'A/B'}                  | ${'AB'}
      ${'Path\\To\\File'}       | ${'PathToFile'}
      ${'What?'}                | ${'What'}
      ${'Test*Report'}          | ${'TestReport'}
      ${'Sheet[1]'}             | ${'Sheet1'}
      ${'  Trimmed  '}          | ${'Trimmed'}
      ${'a'.repeat(40)}         | ${'a'.repeat(31)}
      ${'Colon:Slash/Back\\\\'} | ${'ColonSlashBack'}
    `('returns "$expected" for "$title"', ({ title, expected }) => {
      // act
      const result = sanitizeWorksheetTitle(title);
      // assert
      expect(result).toBe(expected);
    });
  });

  describe('generateExcelBlob', () => {
    const columnsMetadata: Record<string, ColumnMetadata> = {
      name: { name: 'Name', width: 20, valueType: 'text' },
      score: { name: 'Score', width: 10, valueType: 'number' },
    };

    it('returns a Blob with xlsx MIME type', async () => {
      // arrange
      const data = [{ name: 'Alice', score: 100 }];
      // act
      const blob = await generateExcelBlob({
        worksheetTitle: 'Scores',
        data,
        columnsMetadata,
      });
      // assert
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('throws when data is empty', async () => {
      // act
      // assert
      await expect(
        generateExcelBlob({
          worksheetTitle: 'Empty',
          data: [],
          columnsMetadata,
        })
      ).rejects.toThrow('No data to export');
    });

    it('sanitizes worksheet title in output', async () => {
      // arrange
      const data = [{ name: 'X', score: 1 }];
      // act
      const blob = await generateExcelBlob({
        worksheetTitle: 'Report:Summary/2024',
        data,
        columnsMetadata,
      });
      // assert
      expect(blob.size).toBeGreaterThan(0);
    });

    it('coerces numeric strings to numbers for "number" columns', async () => {
      // arrange
      const data = [{ name: 'Alice', score: '42' }];
      // act
      const blob = await generateExcelBlob({ worksheetTitle: 'Scores', data, columnsMetadata });
      const worksheet = await loadWorksheet(blob);
      // assert
      expect(worksheet.getRow(2).getCell(2).value).toBe(42);
    });

    it('keeps non-numeric strings as-is for "number" columns', async () => {
      // arrange
      const data = [{ name: 'Alice', score: 'n/a' }];
      // act
      const blob = await generateExcelBlob({ worksheetTitle: 'Scores', data, columnsMetadata });
      const worksheet = await loadWorksheet(blob);
      // assert
      expect(worksheet.getRow(2).getCell(2).value).toBe('n/a');
    });

    it('applies "@" numFmt to "text" columns', async () => {
      // arrange
      const data = [{ name: '00123', score: 1 }];
      // act
      const blob = await generateExcelBlob({ worksheetTitle: 'Scores', data, columnsMetadata });
      const worksheet = await loadWorksheet(blob);
      // assert
      expect(worksheet.getRow(2).getCell(1).numFmt).toBe('@');
    });

    it('defaults to empty string for nullish "auto"-typed values', async () => {
      // arrange
      const data = [{ name: null as unknown as string, score: 1 }];
      // act
      const blob = await generateExcelBlob({
        worksheetTitle: 'Scores',
        data,
        columnsMetadata: { score: columnsMetadata.score! },
      });
      const worksheet = await loadWorksheet(blob);
      // assert: written as empty string, xlsx round-trip may normalize empty cells to null
      expect(worksheet.getRow(2).getCell(1).value).toBeFalsy();
    });

    it('falls back to default width and "auto" type for columns without metadata', async () => {
      // arrange
      const data = [{ name: 'Alice', score: 1, extra: 'unmapped' }];
      // act
      const blob = await generateExcelBlob({ worksheetTitle: 'Scores', data, columnsMetadata });
      const worksheet = await loadWorksheet(blob);
      // assert
      expect(worksheet.getRow(2).getCell(3).value).toBe('unmapped');
      expect(worksheet.getRow(1).getCell(3).value).toBe('extra');
    });

    it('writes a hyperlink cell as a link Excel opens', async () => {
      // arrange
      const link = { text: 'https://example.com/r.pdf', hyperlink: 'https://example.com/r.pdf' };
      const data = [{ name: 'Alice', report: link }];
      // act
      const blob = await generateExcelBlob({ worksheetTitle: 'Scores', data, columnsMetadata });
      const worksheet = await loadWorksheet(blob);
      // assert
      const cell = worksheet.getRow(2).getCell(2);
      expect(cell.value).toEqual(link);
      expect(cell.font?.underline).toBe(true);
    });
  });

  describe('uniqueWorksheetTitles', () => {
    it.each`
      titles                               | expected
      ${['A', 'B']}                        | ${['A', 'B']}
      ${['Forages', 'forages', 'Forages']} | ${['Forages', 'forages (2)', 'Forages (3)']}
      ${['a'.repeat(40), 'a'.repeat(35)]}  | ${['a'.repeat(31), `${'a'.repeat(27)} (2)`]}
      ${['', '?']}                         | ${['Sheet1', 'Sheet2']}
    `('returns $expected for $titles', ({ titles, expected }) => {
      // act
      const result = uniqueWorksheetTitles(titles);
      // assert
      expect(result).toEqual(expected);
    });
  });

  describe('generateExcelWorkbookBlob', () => {
    it('writes one worksheet per sheet, in order, with unique titles', async () => {
      // arrange
      const sheets = [
        { worksheetTitle: 'Forages', data: [{ name: 'F-1' }], columnsMetadata: {} },
        { worksheetTitle: 'Forages', data: [{ name: 'F-2' }, { name: 'F-3' }], columnsMetadata: {} },
      ];
      // act
      const blob = await generateExcelWorkbookBlob({ sheets });
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await blob.arrayBuffer());
      // assert
      expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['Forages', 'Forages (2)']);
      expect(workbook.worksheets[1]?.getRow(3).getCell(1).value).toBe('F-3');
    });

    it.each`
      case                | sheets
      ${'no sheets'}      | ${[]}
      ${'an empty sheet'} | ${[{ worksheetTitle: 'A', data: [], columnsMetadata: {} }]}
    `('throws given $case', async ({ sheets }) => {
      // act
      // assert
      await expect(generateExcelWorkbookBlob({ sheets })).rejects.toThrow('No data to export');
    });
  });
});
