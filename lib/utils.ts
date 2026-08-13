import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number | string, currency = "CNY") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatNumber(value: number | string) {
  return new Intl.NumberFormat("zh-CN").format(Number(value || 0));
}

export function toNumber(value: unknown) {
  if (value == null || value === "") return 0;
  if (typeof value === "number") return value;
  return Number(String(value).replace(/[,$￥¥£\s]|RMB|USD|CNY/gi, "")) || 0;
}

export function toDate(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + value * 86400000);
  }
  const parsed = new Date(String(value || ""));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function monthKey(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
