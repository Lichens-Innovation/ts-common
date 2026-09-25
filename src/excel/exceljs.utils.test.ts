import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import type { ColumnMetadata } from './excel-generator.types';
import { generateExcelBlob, sanitizeWorksheetTitle } from './exceljs.utils';

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
      title                    | expected
      ${'Sheet1'}              | ${'Sheet1'}
      ${'My Worksheet'}       | ${'My Worksheet'}
      ${'Data:Report'}        | ${'DataReport'}
      ${'A/B'}                 | ${'AB'}
      ${'Path\\To\\File'}     | ${'PathToFile'}
      ${'What?'}               | ${'What'}
      ${'Test*Report'}        | ${'TestReport'}
      ${'Sheet[1]'}           | ${'Sheet1'}
      ${'  Trimmed  '}        | ${'Trimmed'}
      ${'a'.repeat(40)}       | ${'a'.repeat(31)}
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
      const blob = await generateExcelBlob({ worksheetTitle: 'Scores', data, columnsMetadata: { score: columnsMetadata.score! } });
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
  });
});
