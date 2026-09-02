import { jsPDF, type ImageCompression, type ImageFormat } from 'jspdf';
import { autoTable, type MarginPaddingInput } from 'jspdf-autotable';
import { isNullish, type Dimensions } from '../utils';
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

  /** Current Y position (in doc units) for layout. */
  get currentY(): number {
    return this._currentY;
  }

  /** Set current Y position (e.g. after custom content like header or chart). */
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
    console.warn('[checkTableOverflow] table overflow', infos);
  }

  private computeTableMargins({ tableWidth, tableAlign }: ComputeTableMarginsArgs): MarginPaddingInput {
    const leftover = this.availableWidth - tableWidth;
    const alignOffsets: Record<TableCellHalign, number> = { left: 0, center: leftover / 2, right: leftover };
    const offset = alignOffsets[tableAlign];
    return { left: this.margin + offset, right: this.margin + (leftover - offset) };
  }

  public addTable(addTableArgs: AddTableArgs) {
    const {
      lineWidth = 0.005,
      lineColor = 0,
      drawLineForTable = true,
      drawLineForCells = true,
      head,
      body,
      startY = this._currentY,
      columnWidths,
      cellPadding = 0.05,
      tableAlign = 'left',
    } = addTableArgs;

    if (body.length === 0) {
      this._currentY = startY;
      return startY;
    }

    const fontSize = this.theme.fontSize.small;
    const colCount = columnWidths?.length ?? Math.max(...body.map((row) => row.length), 0);
    const widths = columnWidths ?? Array(colCount).fill(this.availableWidth / colCount);
    const columnStyles: Record<number, CellStyle> = {};
    widths.forEach((cellWidth, i) => {
      columnStyles[i] = { cellWidth, ...addTableArgs.columnStyles?.[i] };
    });

    const tableLineWidth = drawLineForTable ? lineWidth : 0;
    const cellLineWidth = drawLineForCells ? lineWidth : 0;

    const tableWidth = widths.reduce((sum, width) => sum + width, 0);
    const margin: MarginPaddingInput = this.computeTableMargins({ tableWidth, tableAlign });

    autoTable(this.doc, {
      startY,
      head: !isNullish(head) ? [head] : undefined,
      body,
      theme: 'grid',
      tableLineWidth,
      tableLineColor: lineColor,
      margin,
      bodyStyles: { fontSize, font: this.font, cellPadding, lineWidth: cellLineWidth, lineColor },
      headStyles: { fontSize, font: this.font, cellPadding, lineWidth: cellLineWidth, lineColor },
      columnStyles,
    });

    const finalY = (this.doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? startY;
    this._currentY = finalY;
  }

  /**
   * Add an image at the given position and size. Does not update currentY.
   */
  public addImage({ dataUri, x, y, width, height, format = 'PNG', compression = 'MEDIUM' }: AddImageArgs): void {
    this.doc.addImage(dataUri, format, x, y, width, height, undefined, compression);
  }

  /** Exposes the jsPDF document for custom drawing (e.g. header text, status badge, certification). */
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

    // Calculate height based on canvas aspect ratio to maintain proper proportions
    const height = width / aspectRatio;

    // Ensure the image doesn't exceed available space (accounting for footer)
    const maxHeight = this.availableHeight - this.footerHeight - IMAGE_GAP;
    const finalHeight = Math.min(height, maxHeight);

    // If image is reduced, adjust width to maintain aspect ratio
    const finalWidth = finalHeight < height ? finalHeight * aspectRatio : width;

    return { width: finalWidth, height: finalHeight };
  }

  public save(): void {
    this.doc.save(this.filename);
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
    if (!this.options.hasFooter) {
      console.warn('[renderFooters] Footer is disabled');
      return;
    }

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

  /** Footer is a single line; height derived from font size and table padding. */
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

    // Save current style state
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
      console.error('[drawAvailableAreaRectangle] Error drawing available area rect', error);
    } finally {
      // Restore previous state
      this.doc.setDrawColor(currentDrawColor);
      this.doc.setLineWidth(currentLineWidth);
    }
  }
}
