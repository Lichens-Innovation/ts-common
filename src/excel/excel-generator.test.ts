import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { WorksheetBuilder } from './excel-generator';
import type { CellStyle } from './excel-generator.types';

function createWorksheet(): ExcelJS.Worksheet {
  const workbook = new ExcelJS.Workbook();
  return workbook.addWorksheet('Test');
}

describe('WorksheetBuilder', () => {
  it('starts with rowCount 1', () => {
    // arrange
    const sheet = createWorksheet();
    // act
    const builder = new WorksheetBuilder(sheet);
    // assert
    expect(builder.rowCount).toBe(1);
  });

  it('addRow appends values and increments rowCount', () => {
    // arrange
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    // act
    builder.addRow({ values: ['A', 'B', 'C'] });
    // assert
    expect(builder.rowCount).toBe(2);
    // act
    builder.addRow({ values: [1, 2, 3] });
    // assert
    expect(builder.rowCount).toBe(3);
    // act
    const ws = builder.getWorksheet();
    // assert
    expect(ws.getRow(1).getCell(1).value).toBe('A');
    expect(ws.getRow(1).getCell(2).value).toBe('B');
    expect(ws.getRow(2).getCell(1).value).toBe(1);
  });

  it('addCell sets value at given row and col (0-based)', () => {
    // arrange
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    // act
    builder.addCell({ row: 0, col: 0, value: 'Header' });
    builder.addCell({ row: 0, col: 1, value: 42 });
    const ws = builder.getWorksheet();
    // assert
    expect(ws.getRow(1).getCell(1).value).toBe('Header');
    expect(ws.getRow(1).getCell(2).value).toBe(42);
  });

  it('addEmptyRow increments rowCount', () => {
    // arrange
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    // act
    builder.addEmptyRow();
    // assert
    expect(builder.rowCount).toBe(2);
    // act
    builder.addEmptyRow();
    // assert
    expect(builder.rowCount).toBe(3);
  });

  it('setColumnWidths configures worksheet columns', () => {
    // arrange
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    // act
    builder.setColumnWidths([10, 20, 15]);
    const ws = builder.getWorksheet();
    // assert
    expect(ws.columns).toBeDefined();
    expect(ws.columns?.length).toBe(3);
  });

  it('getWorksheet returns the same worksheet instance', () => {
    // arrange
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    // act
    const result = builder.getWorksheet();
    // assert
    expect(result).toBe(sheet);
  });

  it('applies cell style when provided in addCell', () => {
    // arrange
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    const style: CellStyle = { font: { bold: true }, numFmt: '@' };
    // act
    builder.addCell({ row: 0, col: 0, value: 'Bold', style });
    const ws = builder.getWorksheet();
    const cell = ws.getRow(1).getCell(1);
    // assert
    expect(cell.value).toBe('Bold');
    expect(cell.font?.bold).toBe(true);
    expect(cell.numFmt).toBe('@');
  });

  it('applies row styles when provided in addRow', () => {
    // arrange
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    const styles: CellStyle[] = [{ font: { bold: true } }, {}, { numFmt: '0.00' }];
    // act
    builder.addRow({ values: ['A', 'B', 'C'], styles });
    const ws = builder.getWorksheet();
    // assert
    expect(ws.getRow(1).getCell(1).font?.bold).toBe(true);
    expect(ws.getRow(1).getCell(3).numFmt).toBe('0.00');
  });

  it('setDefaultRowStyles applies to subsequent addRow without styles', () => {
    // arrange
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    // act
    builder.setDefaultRowStyles([{ font: { italic: true } }, {}, {}]);
    builder.addRow({ values: ['X', 'Y', 'Z'] });
    const ws = builder.getWorksheet();
    // assert
    expect(ws.getRow(1).getCell(1).font?.italic).toBe(true);
  });
});
