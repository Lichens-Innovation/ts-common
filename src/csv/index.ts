import Papa from "papaparse";
import { getMimeType } from "../mime";

export type CellValue = string | number | null | undefined;

export const convertToCsvRow = (row: Record<string, CellValue>): Record<string, string> => {
  const stringRow: Record<string, string> = {};

  for (const [key, value] of Object.entries(row)) {
    stringRow[key] = String(value ?? "");
  }

  return stringRow;
};

export const generateCsvBlob = (data: Record<string, CellValue>[]): Blob => {
  const rows: Record<string, string>[] = data.map(convertToCsvRow);
  const csv = Papa.unparse(rows, { header: true, delimiter: "," });

  return new Blob([csv], { type: getMimeType("csv") });
};
