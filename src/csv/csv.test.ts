import { describe, expect, it } from 'vitest';
import type { CellValue } from './index';
import { convertToCsvRow, generateCsvBlob } from './index';

describe('CSV utilities', () => {
  describe('convertToCsvRow', () => {
    it('converts all values to strings', () => {
      // arrange
      const row: Record<string, CellValue> = { a: 1, b: 'x', c: null, d: undefined };
      // act
      const result = convertToCsvRow(row);
      // assert
      expect(result).toEqual({ a: '1', b: 'x', c: '', d: '' });
    });

    it('preserves keys order via object entries', () => {
      // arrange
      const row: Record<string, CellValue> = { name: 'Test', count: 42 };
      // act
      const result = convertToCsvRow(row);
      // assert
      expect(Object.keys(result)).toEqual(['name', 'count']);
      expect(result).toEqual({ name: 'Test', count: '42' });
    });

    it('handles empty object', () => {
      // act
      const result = convertToCsvRow({});
      // assert
      expect(result).toEqual({});
    });
  });

  describe('generateCsvBlob', () => {
    it('returns a Blob with CSV content and correct MIME type', () => {
      // arrange
      const data: Record<string, CellValue>[] = [
        { col1: 'a', col2: 1 },
        { col1: 'b', col2: 2 },
      ];
      // act
      const blob = generateCsvBlob(data);
      // assert
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv');
    });

    it('produces valid CSV with header when read as text', async () => {
      // arrange
      const data: Record<string, CellValue>[] = [
        { name: 'Alice', score: 100 },
        { name: 'Bob', score: 85 },
      ];
      // act
      const blob = generateCsvBlob(data);
      const text = await blob.text();
      // assert
      expect(text).toContain('name');
      expect(text).toContain('score');
      expect(text).toContain('Alice');
      expect(text).toContain('100');
      expect(text).toContain('Bob');
      expect(text).toContain('85');
    });

    it('handles empty array', () => {
      // act
      const blob = generateCsvBlob([]);
      // assert
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv');
    });
  });
});
