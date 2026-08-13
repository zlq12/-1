import { Currency, ImportSource } from "@prisma/client";
import { toDate, toNumber } from "@/lib/utils";

export const standardFieldAliases: Record<string, string[]> = {
  date: ["date", "日期", "purchase date", "order date", "销售日期", "付款日期"],
  storeName: ["store", "store name", "店铺", "店铺名称"],
  marketplace: ["marketplace", "站点", "国家", "site"],
  orderId: ["order id", "订单号", "amazon-order-id", "订单编号"],
  parentProductName: ["parent product", "父产品", "父产品名称"],
  childProductName: ["child product", "子产品", "子产品名称", "变体名称"],
  productName: ["product name", "商品名称", "品名", "title", "item name"],
  sku: ["sku", "seller sku", "msku", "商品编码", "卖家sku"],
  asin: ["asin", "子asin", "child asin"],
  parentAsin: ["parent asin", "父asin"],
  variationType: ["variation type", "变体类型", "规格类型"],
  variationValue: ["variation value", "变体值", "规格"],
  quantity: ["units ordered", "销量", "quantity", "ordered units", "订单商品数"],
  grossSales: ["ordered product sales", "销售额", "sales", "revenue", "商品销售额"],
  refundAmount: ["refund", "退款金额", "refund amount"],
  netSales: ["net sales", "净销售额", "净收入"],
  currency: ["currency", "币种"],
  sessions: ["sessions", "访问量"],
  pageViews: ["page views", "浏览量"],
  conversionRate: ["unit session percentage", "转化率"],
  buyBoxPercentage: ["buy box percentage", "buy box占比"],
  unitsOrdered: ["units ordered", "订购商品数"]
};

export const standardFields = Object.keys(standardFieldAliases);

export function normalizeHeader(input: string) {
  return input
    .toLowerCase()
    .replace(/[\s_\-()（）[\]{}:：,，.。/\\|"'`~!@#$%^&*+=?？<>《》￥¥£]/g, "")
    .trim();
}

export function autoMapHeaders(headers: string[]) {
  const normalizedHeaders = new Map(headers.map((header) => [normalizeHeader(header), header]));
  const mapping: Record<string, string> = {};
  for (const [field, aliases] of Object.entries(standardFieldAliases)) {
    for (const alias of aliases) {
      const matched = normalizedHeaders.get(normalizeHeader(alias));
      if (matched) {
        mapping[field] = matched;
        break;
      }
    }
  }
  return mapping;
}

export function detectSource(headers: string[]): ImportSource {
  const normalized = headers.map(normalizeHeader).join("|");
  if (normalized.includes("amazonorderid") || normalized.includes("orderedproductsales")) return "amazon_seller_central";
  if (normalized.includes("campaign") || normalized.includes("adgroup") || normalized.includes("acos")) return "amazon_advertising";
  if (normalized.includes("msku") || normalized.includes("店铺") || normalized.includes("领星")) return "lingxing_erp";
  return "unknown";
}

export function applyMapping(row: Record<string, unknown>, mapping: Record<string, string>) {
  const get = (field: string) => row[mapping[field]];
  const grossSales = toNumber(get("grossSales"));
  const refundAmount = toNumber(get("refundAmount"));
  const netSales = mapping.netSales ? toNumber(get("netSales")) : grossSales - refundAmount;
  return {
    storeName: stringOrNull(get("storeName")),
    marketplace: stringOrNull(get("marketplace")),
    orderId: stringOrNull(get("orderId")),
    date: toDate(get("date")),
    parentProductName: stringOrNull(get("parentProductName")),
    childProductName: stringOrNull(get("childProductName")),
    productName: String(get("productName") || get("sku") || "未命名产品"),
    sku: String(get("sku") || ""),
    asin: stringOrNull(get("asin")),
    parentAsin: stringOrNull(get("parentAsin")),
    variationType: stringOrNull(get("variationType")),
    variationValue: stringOrNull(get("variationValue")),
    quantity: Math.round(toNumber(get("quantity"))),
    grossSales,
    refundAmount,
    netSales,
    currency: String(get("currency") || "USD").toUpperCase() === "CNY" ? Currency.CNY : Currency.USD,
    sessions: optionalInt(get("sessions")),
    pageViews: optionalInt(get("pageViews")),
    conversionRate: optionalRate(get("conversionRate")),
    buyBoxPercentage: optionalRate(get("buyBoxPercentage")),
    unitsOrdered: optionalInt(get("unitsOrdered")),
    rawData: row
  };
}

export function buildDuplicateKey(source: string, record: { orderId?: string | null; sku: string; asin?: string | null; date: Date; quantity: number; grossSales: number }) {
  const date = record.date.toISOString().slice(0, 10);
  if (record.orderId) return [source, record.orderId, record.sku, date].join("|");
  return [source, record.sku, record.asin || "", date, record.quantity, record.grossSales].join("|");
}

function stringOrNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function optionalInt(value: unknown) {
  if (value == null || value === "") return null;
  return Math.round(toNumber(value));
}

function optionalRate(value: unknown) {
  if (value == null || value === "") return null;
  const number = toNumber(value);
  return number > 1 ? number / 100 : number;
}
