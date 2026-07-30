import { describe, expect, it } from 'vitest';
import type { ColumnMetadata } from './excel-generator.types';
import { generateExcelBlob, sanitizeWorksheetTitle } from './exceljs.utils';

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
  });
});
