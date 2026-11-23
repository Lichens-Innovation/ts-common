import { jsPDF, type ImageCompression, type ImageFormat } from 'jspdf';
import { autoTable, type MarginPaddingInput, type UserOptions } from 'jspdf-autotable';
import { isNullish } from '../utils/runtime/types.utils';
import { type Dimensions } from '../utils/number/dimensions.utils';
import {
  DEFAULT_FOOTER_CELL_BUILDER,
  DEFAULT_OPTIONS,
  IMAGE_GAP,
  type AddImageArgs,
  type AddTableArgs,
  type CellStyle,
  type ComputeTableMarginsArgs,
  type PageSize,
  type PdfOptions,
  type TableCellHalign,
  type ThemeConfig,
} from './pdf-generator.types';

interface LastAutoTable {
  finalY: number;
}

interface JsPdfWithLastAutoTable {
  lastAutoTable?: LastAutoTable;
}

const buildColumnStyles = (widths: number[], columnStyles?: Record<number, CellStyle>): Record<number, CellStyle> => {
  const styles: Record<number, CellStyle> = {};
  widths.forEach((cellWidth, i) => {
    styles[i] = { cellWidth, ...columnStyles?.[i] };
  });
  return styles;
};

export class PdfGenerator {
  private doc: jsPDF;
  private options: Required<PdfOptions>;
  private _currentY: number;

  constructor(options: PdfOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const { orientation, paperFormat } = this.options;
    this.doc = new jsPDF({ orientation, format: paperFormat, unit: 'in' });
    this.doc.setFont('helvetica');

    this._currentY = this.margin;
  }

  get font(): string {
    return this.doc.getFont().fontName;
  }

  set font(font: string) {
    this.doc.setFont(font);
  }

  get theme(): ThemeConfig {
    return this.options.theme;
  }

  get filename(): string {
    return this.options.filename;
  }

  get margin(): number {
    return this.options.margin;
  }

  get pageSize(): PageSize {
    return this.doc.internal.pageSize;
  }

  get pageWidth(): number {
    return this.pageSize.width;
  }

  get pageHeight(): number {
    return this.pageSize.height;
  }

  get fullImageHeight(): number {
    return this.availableHeight - this.footerHeight - IMAGE_GAP;
  }

  get availableWidth(): number {
    return this.pageWidth - 2 * this.margin;
  }

  get availableHeight(): number {
    return this.pageHeight - 2 * this.margin;
  }

  get footerFontSizePoints(): number {
    return this.theme.fontSize.tiny;
  }

  get currentY(): number {
    return this._currentY;
  }

  public setCurrentY(y: number): void {
    this._currentY = y;
  }

  public addVerticalGap(delta: number): void {
    this._currentY += delta;
  }

  public checkTableOverflow(columnWidths: number[]): void {
    const computedSum = columnWidths.reduce((acc, width) => acc + width, 0);
    if (computedSum <= this.availableWidth) return;

    const infos = {
      availableWidth: this.availableWidth,
      computedSum,
      columnWidths: JSON.stringify(columnWidths),
    };
    // eslint-disable-next-line no-console -- this public check exists only to report overflow to the caller
    console.warn('[checkTableOverflow] table overflow', infos);
  }

  private computeTableMargins({ tableWidth, tableAlign }: ComputeTableMarginsArgs): MarginPaddingInput {
    const leftover = this.availableWidth - tableWidth;
    const alignOffsets: Record<TableCellHalign, number> = { left: 0, center: leftover / 2, right: leftover };
    const offset = alignOffsets[tableAlign];
    return { left: this.margin + offset, right: this.margin + (leftover - offset) };
  }

  private resolveColumnWidths({ body, columnWidths }: AddTableArgs): number[] {
    if (columnWidths) return columnWidths;

    const colCount = Math.max(...body.map((row) => row.length), 0);
    return Array(colCount).fill(this.availableWidth / colCount);
  }

  private buildAutoTableOptions(addTableArgs: AddTableArgs, startY: number): UserOptions {
    const {
      lineWidth = 0.005,
      lineColor = 0,
      drawLineForTable = true,
      drawLineForCells = true,
      head,
      body,
      cellPadding = 0.05,
      tableAlign = 'left',
    } = addTableArgs;

    const widths = this.resolveColumnWidths(addTableArgs);
    const tableWidth = widths.reduce((sum, width) => sum + width, 0);
    const cellLineWidth = drawLineForCells ? lineWidth : 0;
    const fontSize = this.theme.fontSize.small;
    const cellStyles = { fontSize, font: this.font, cellPadding, lineWidth: cellLineWidth, lineColor };

    return {
      startY,
      head: isNullish(head) ? undefined : [head],
      body,
      theme: 'grid',
      tableLineWidth: drawLineForTable ? lineWidth : 0,
      tableLineColor: lineColor,
      margin: this.computeTableMargins({ tableWidth, tableAlign }),
      bodyStyles: cellStyles,
      headStyles: { ...cellStyles },
      columnStyles: buildColumnStyles(widths, addTableArgs.columnStyles),
    };
  }

  public addTable(addTableArgs: AddTableArgs) {
    const { body, startY = this._currentY } = addTableArgs;

    if (body.length === 0) {
      this._currentY = startY;
      return startY;
    }

    autoTable(this.doc, this.buildAutoTableOptions(addTableArgs, startY));
    this._currentY = (this.doc as unknown as JsPdfWithLastAutoTable).lastAutoTable?.finalY ?? startY;
  }

  /** Does not update currentY. habit-hooks-disable non-essential-comment */
  public addImage({ dataUri, x, y, width, height, format = 'PNG', compression = 'MEDIUM' }: AddImageArgs): void {
    this.doc.addImage(dataUri, format, x, y, width, height, undefined, compression);
  }

  public getDoc(): jsPDF {
    return this.doc;
  }

  public addPage() {
    this.doc.addPage();
  }

  public addFullPagePNG(dataURI: string, aspectRatio: number, compression: ImageCompression = 'MEDIUM'): void {
    const imageFormat: ImageFormat = 'PNG';

    const alias = undefined;
    const x = this.margin;
    const y = this.margin;
    const { width, height } = this.calculateImageDimensions(aspectRatio);

    this.doc.addImage(dataURI, imageFormat, x, y, width, height, alias, compression);

    this._currentY = this.margin + height + IMAGE_GAP;
  }

  private calculateImageDimensions(aspectRatio: number): Dimensions {
    const width = this.availableWidth;
    const height = width / aspectRatio;
    const finalHeight = Math.min(height, this.fullImageHeight);
    const finalWidth = finalHeight < height ? finalHeight * aspectRatio : width;

    return { width: finalWidth, height: finalHeight };
  }

  public save(): void {
    this.doc.save(this.filename);
  }

  public toBlob(): Blob {
    return this.doc.output('blob');
  }

  private buildFooterColumnStyles() {
    const cellWidth = this.availableWidth / 3;

    return {
      0: { cellWidth, halign: 'left' as const },
      1: { cellWidth, halign: 'center' as const },
      2: { cellWidth, halign: 'right' as const },
    };
  }

  public renderFooters(): void {
    if (!this.options.hasFooter) return;

    const totalPages = this.doc.getNumberOfPages();
    const columnStyles = this.buildFooterColumnStyles();
    const startY = this.pageHeight - this.margin - this.footerHeight;

    const footerCellBuilder = this.options.footerCellBuilder ?? DEFAULT_FOOTER_CELL_BUILDER;

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      this.doc.setPage(currentPage);
      this.drawAvailableAreaRectangle();
      const footerCells = (['left', 'center', 'right'] as const).map((align) => ({
        content: footerCellBuilder({ align, currentPage, totalPages }),
      }));

      autoTable(this.doc, {
        startY,
        body: [footerCells],
        theme: 'plain',
        bodyStyles: { fontSize: this.footerFontSizePoints, font: this.font },
        margin: { left: this.margin, right: this.margin },
        columnStyles,
      });
    }
  }

  get footerHeight(): number {
    if (!this.options.hasFooter) {
      return 0;
    }

    const fontSizeInches = this.footerFontSizePoints / 72; // 1 inch = 72 points
    const lineHeight = fontSizeInches * 1.5; // autoTable line height
    return lineHeight + 0.2; // table borders and minimal padding
  }

  private drawAvailableAreaRectangle(): void {
    if (!this.options.displayAvailableAreaRectangle) {
      return;
    }

    const currentDrawColor = this.doc.getDrawColor();
    const currentLineWidth = this.doc.getLineWidth();

    try {
      this.doc.setDrawColor(200, 200, 200); // Light gray
      this.doc.setLineWidth(0.01);
      this.doc.rect(
        this.margin,
        this.margin,
        this.availableWidth,
        this.availableHeight,
        'S' // Stroke only, no fill
      );
    } catch (error) {
      // eslint-disable-next-line no-console -- debug-only overlay: a drawing failure must not abort the export
      console.error('[drawAvailableAreaRectangle] Error drawing available area rect', error);
    } finally {
      this.doc.setDrawColor(currentDrawColor);
      this.doc.setLineWidth(currentLineWidth);
    }
  }
}
