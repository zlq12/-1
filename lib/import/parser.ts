import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedSheet = {
  sheetName: string;
  headers: string[];
  rows: Record<string, unknown>[];
};

export async function parseImportFile(file: File): Promise<ParsedSheet[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.name.toLowerCase().endsWith(".csv")) {
    const text = buffer.toString("utf8").replace(/^\uFEFF/, "");
    const parsed = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true });
    const rows = parsed.data.filter((row) => Object.values(row).some((value) => value !== ""));
    return [{ sheetName: "CSV", headers: parsed.meta.fields || [], rows }];
  }
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  return workbook.SheetNames.map((sheetName) => {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: "" }).filter((row) => Object.values(row).some((value) => value !== ""));
    return { sheetName, headers: rows[0] ? Object.keys(rows[0]) : [], rows };
  });
}
