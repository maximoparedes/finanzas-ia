import "server-only";
import ExcelJS from "exceljs";
import { Readable } from "node:stream";
import { computeDedupeHash } from "@/lib/dedupe";
import type { PaymentMethod } from "@/lib/types";

// Los headers exactos del export de Mercado Pago no están confirmados todavía
// (hay que probar contra un archivo real descargado desde "Actividad"). Este
// mapeo usa alias flexibles y case-insensitive para tolerar variaciones de
// nombre de columna; si el archivo real trae headers distintos, agregar el
// alias correspondiente acá.
const COLUMN_ALIASES = {
  date: ["fecha", "date", "fecha de la transacción", "fecha de operación"],
  description: ["descripción", "descripcion", "detalle", "concepto", "description", "detalle de la operación"],
  amount: ["monto", "importe", "amount", "valor", "monto de la transacción"],
  paymentMethod: ["medio de pago", "medio", "forma de pago", "payment_method"],
};

export interface ParsedRow {
  date: string; // "YYYY-MM-DD"
  amount: number; // siempre positivo (monto del gasto)
  description: string;
  paymentMethod: PaymentMethod;
  dedupeHash: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  skipped: number; // filas ignoradas: sin monto/descripción, o montos entrantes (ingresos)
  totalRows: number;
}

function normalizeHeader(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function findColumnIndex(headerRow: ExcelJS.Row, aliases: string[]): number | null {
  let found: number | null = null;
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const normalized = normalizeHeader(cell.value);
    if (aliases.includes(normalized)) {
      found = colNumber;
    }
  });
  return found;
}

function cellToText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "object") {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value) return cellToText(value.result as ExcelJS.CellValue);
  }
  return String(value).trim();
}

function cellToNumber(value: ExcelJS.CellValue): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "result" in value) {
    return cellToNumber((value as { result: ExcelJS.CellValue }).result);
  }
  const text = cellToText(value).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function cellToDate(value: ExcelJS.CellValue): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = cellToText(value);
  // admite "DD/MM/YYYY" (formato habitual de exports argentinos) y "YYYY-MM-DD"
  const ddmmyyyy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const isoLike = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoLike) {
    const [, y, m, d] = isoLike;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function mapPaymentMethod(text: string): PaymentMethod {
  const normalized = text.trim().toLowerCase();
  if (normalized.includes("débito") || normalized.includes("debito")) return "debito";
  if (normalized.includes("crédito") || normalized.includes("credito")) return "credito";
  if (normalized.includes("transferencia")) return "transferencia";
  if (normalized.includes("efectivo")) return "efectivo";
  return "otro";
}

export async function parseMercadoPagoExport(
  buffer: Buffer,
  filename: string
): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  const isCsv = filename.toLowerCase().endsWith(".csv");

  if (isCsv) {
    await workbook.csv.read(Readable.from(buffer));
  } else {
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { rows: [], skipped: 0, totalRows: 0 };
  }

  const headerRow = worksheet.getRow(1);
  const dateCol = findColumnIndex(headerRow, COLUMN_ALIASES.date);
  const descCol = findColumnIndex(headerRow, COLUMN_ALIASES.description);
  const amountCol = findColumnIndex(headerRow, COLUMN_ALIASES.amount);
  const paymentCol = findColumnIndex(headerRow, COLUMN_ALIASES.paymentMethod);

  if (!dateCol || !descCol || !amountCol) {
    throw new Error(
      "No se pudieron detectar las columnas de fecha/descripción/monto en el archivo. Revisá los headers del export."
    );
  }

  const rows: ParsedRow[] = [];
  let skipped = 0;
  let totalRows = 0;

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // header
    totalRows++;

    const date = cellToDate(row.getCell(dateCol).value);
    const description = cellToText(row.getCell(descCol).value);
    const rawAmount = cellToNumber(row.getCell(amountCol).value);
    const paymentMethod = paymentCol
      ? mapPaymentMethod(cellToText(row.getCell(paymentCol).value))
      : "otro";

    // Se importan solo los movimientos salientes (gastos). MP suele exportar
    // los ingresos con signo positivo y los pagos/egresos con signo negativo;
    // si el archivo real no sigue esa convención, ajustar acá.
    if (!date || !description || rawAmount === null || rawAmount >= 0) {
      skipped++;
      return;
    }

    const amount = Math.abs(rawAmount);
    rows.push({
      date,
      amount,
      description,
      paymentMethod,
      dedupeHash: computeDedupeHash({ date, amount, description, paymentMethod }),
    });
  });

  return { rows, skipped, totalRows };
}
