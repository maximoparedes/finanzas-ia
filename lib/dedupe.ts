import "server-only";
import { createHash } from "node:crypto";

export function normalizeDescription(description: string): string {
  return description.trim().toLowerCase().replace(/\s+/g, " ");
}

export function computeDedupeHash(params: {
  date: string; // "YYYY-MM-DD"
  amount: number;
  description: string;
  paymentMethod: string;
}): string {
  const normalized = normalizeDescription(params.description);
  const raw = `${params.date}|${params.amount.toFixed(2)}|${normalized}|${params.paymentMethod}`;
  return createHash("sha256").update(raw).digest("hex");
}
