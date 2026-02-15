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
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    expect(builder.rowCount).toBe(1);
  });

  it('addRow appends values and increments rowCount', () => {
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    builder.addRow({ values: ['A', 'B', 'C'] });
    expect(builder.rowCount).toBe(2);
    builder.addRow({ values: [1, 2, 3] });
    expect(builder.rowCount).toBe(3);
    const ws = builder.getWorksheet();
    expect(ws.getRow(1).getCell(1).value).toBe('A');
    expect(ws.getRow(1).getCell(2).value).toBe('B');
    expect(ws.getRow(2).getCell(1).value).toBe(1);
  });

  it('addCell sets value at given row and col (0-based)', () => {
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    builder.addCell({ row: 0, col: 0, value: 'Header' });
    builder.addCell({ row: 0, col: 1, value: 42 });
    const ws = builder.getWorksheet();
    expect(ws.getRow(1).getCell(1).value).toBe('Header');
    expect(ws.getRow(1).getCell(2).value).toBe(42);
  });

  it('addEmptyRow increments rowCount', () => {
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    builder.addEmptyRow();
    expect(builder.rowCount).toBe(2);
    builder.addEmptyRow();
    expect(builder.rowCount).toBe(3);
  });

  it('setColumnWidths configures worksheet columns', () => {
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    builder.setColumnWidths([10, 20, 15]);
    const ws = builder.getWorksheet();
    expect(ws.columns).toBeDefined();
    expect(ws.columns?.length).toBe(3);
  });

  it('getWorksheet returns the same worksheet instance', () => {
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    expect(builder.getWorksheet()).toBe(sheet);
  });

  it('applies cell style when provided in addCell', () => {
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    const style: CellStyle = { font: { bold: true }, numFmt: '@' };
    builder.addCell({ row: 0, col: 0, value: 'Bold', style });
    const ws = builder.getWorksheet();
    const cell = ws.getRow(1).getCell(1);
    expect(cell.value).toBe('Bold');
    expect(cell.font?.bold).toBe(true);
    expect(cell.numFmt).toBe('@');
  });

  it('applies row styles when provided in addRow', () => {
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    const styles: CellStyle[] = [{ font: { bold: true } }, {}, { numFmt: '0.00' }];
    builder.addRow({ values: ['A', 'B', 'C'], styles });
    const ws = builder.getWorksheet();
    expect(ws.getRow(1).getCell(1).font?.bold).toBe(true);
    expect(ws.getRow(1).getCell(3).numFmt).toBe('0.00');
  });

  it('setDefaultRowStyles applies to subsequent addRow without styles', () => {
    const sheet = createWorksheet();
    const builder = new WorksheetBuilder(sheet);
    builder.setDefaultRowStyles([{ font: { italic: true } }, {}, {}]);
    builder.addRow({ values: ['X', 'Y', 'Z'] });
    const ws = builder.getWorksheet();
    expect(ws.getRow(1).getCell(1).font?.italic).toBe(true);
  });
});
