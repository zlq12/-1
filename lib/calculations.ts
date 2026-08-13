import { monthKey } from "@/lib/utils";

type MoneyRecord = {
  amountInBaseCurrency: unknown;
  type?: string;
  category?: string;
  date?: Date | string;
  partnerName?: string;
  payer?: string;
};

type SaleRecord = {
  date: Date | string;
  parentProductName?: string | null;
  childProductName?: string | null;
  productName: string;
  sku: string;
  asin?: string | null;
  storeName?: string | null;
  marketplace?: string | null;
  quantity: number;
  grossSales: unknown;
  refundAmount: unknown;
  netSales: unknown;
  orderId?: string | null;
  sessions?: number | null;
  pageViews?: number | null;
};

const n = (value: unknown) => Number(value || 0);

export function calculateRealInvestment(investments: MoneyRecord[]) {
  return investments
    .filter((item) => item.type === "initial_investment")
    .reduce((sum, item) => sum + n(item.amountInBaseCurrency), 0);
}

export function calculateReturnInvestment(investments: MoneyRecord[]) {
  return investments
    .filter((item) => item.type === "additional_investment")
    .reduce((sum, item) => sum + n(item.amountInBaseCurrency), 0);
}

export function calculateTotalInvestment(investments: MoneyRecord[]) {
  return calculateRealInvestment(investments) + calculateReturnInvestment(investments);
}

export function calculatePartnerBalance(investments: MoneyRecord[]) {
  const map = new Map<string, { partnerName: string; initialInvestment: number; returnInvestment: number; totalInvestment: number; net: number }>();
  for (const item of investments) {
    const partnerName = item.partnerName || "未指定";
    const row = map.get(partnerName) || { partnerName, initialInvestment: 0, returnInvestment: 0, totalInvestment: 0, net: 0 };
    const amount = n(item.amountInBaseCurrency);
    if (item.type === "initial_investment") row.initialInvestment += amount;
    if (item.type === "additional_investment") row.returnInvestment += amount;
    row.totalInvestment = row.initialInvestment + row.returnInvestment;
    row.net = row.totalInvestment;
    map.set(partnerName, row);
  }
  return [...map.values()];
}

export function calculateTotalExpense(expenses: MoneyRecord[]) {
  return expenses.reduce((sum, item) => sum + n(item.amountInBaseCurrency), 0);
}

export function calculateExpenseByCategory(expenses: MoneyRecord[]) {
  return groupMoney(expenses, "category");
}

export function calculateMonthlyExpenseTrend(expenses: MoneyRecord[]) {
  return groupMonthly(expenses, "支出");
}

export function calculateSalesSummary(records: SaleRecord[]) {
  const grossSales = records.reduce((sum, item) => sum + n(item.grossSales), 0);
  const netSales = records.reduce((sum, item) => sum + n(item.netSales), 0);
  const refundAmount = records.reduce((sum, item) => sum + n(item.refundAmount), 0);
  const quantity = records.reduce((sum, item) => sum + n(item.quantity), 0);
  const orderCount = new Set(records.map((item) => item.orderId).filter(Boolean)).size || records.length;
  return {
    grossSales,
    netSales,
    refundAmount,
    quantity,
    orderCount,
    averageSellingPrice: quantity ? netSales / quantity : 0,
    productCount: new Set(records.map((item) => item.parentProductName || item.productName)).size,
    skuCount: new Set(records.map((item) => item.sku)).size
  };
}

export function calculateProductSalesRanking(records: SaleRecord[], key: "parentProductName" | "childProductName" | "productName" = "parentProductName") {
  return groupSales(records, (item) => item[key] || item.productName).sort((a, b) => b.netSales - a.netSales);
}

export function calculateSkuSalesRanking(records: SaleRecord[]) {
  return groupSales(records, (item) => item.sku).sort((a, b) => b.quantity - a.quantity);
}

export function calculateChildProductShare(records: SaleRecord[], parentProductName?: string) {
  const rows = parentProductName ? records.filter((item) => item.parentProductName === parentProductName) : records;
  const total = rows.reduce((sum, item) => sum + n(item.netSales), 0);
  return groupSales(rows, (item) => item.childProductName || item.productName).map((item) => ({ ...item, share: total ? item.netSales / total : 0 }));
}

export function calculateMonthlySalesTrend(records: SaleRecord[]) {
  const map = new Map<string, { month: string; grossSales: number; netSales: number; quantity: number }>();
  for (const item of records) {
    const month = monthKey(item.date);
    const row = map.get(month) || { month, grossSales: 0, netSales: 0, quantity: 0 };
    row.grossSales += n(item.grossSales);
    row.netSales += n(item.netSales);
    row.quantity += n(item.quantity);
    map.set(month, row);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function calculateCashBalance(investments: MoneyRecord[], expenses: MoneyRecord[], sales: SaleRecord[]) {
  return calculateTotalInvestment(investments) + calculateSalesSummary(sales).netSales - calculateTotalExpense(expenses);
}

function groupMoney<T extends MoneyRecord>(records: T[], field: keyof T) {
  const map = new Map<string, { name: string; amount: number }>();
  for (const item of records) {
    const name = String(item[field] || "未分类");
    const row = map.get(name) || { name, amount: 0 };
    row.amount += n(item.amountInBaseCurrency);
    map.set(name, row);
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

function groupMonthly(records: MoneyRecord[], label: string) {
  const map = new Map<string, { month: string; amount: number; name: string }>();
  for (const item of records) {
    const month = monthKey(item.date || new Date());
    const row = map.get(month) || { month, amount: 0, name: label };
    row.amount += n(item.amountInBaseCurrency);
    map.set(month, row);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

function groupSales(records: SaleRecord[], getKey: (item: SaleRecord) => string) {
  const map = new Map<string, { name: string; quantity: number; grossSales: number; refundAmount: number; netSales: number; orderCount: number; sessions: number; pageViews: number; averageSellingPrice: number; conversionRate: number }>();
  for (const item of records) {
    const name = getKey(item) || "未命名";
    const row = map.get(name) || { name, quantity: 0, grossSales: 0, refundAmount: 0, netSales: 0, orderCount: 0, sessions: 0, pageViews: 0, averageSellingPrice: 0, conversionRate: 0 };
    row.quantity += n(item.quantity);
    row.grossSales += n(item.grossSales);
    row.refundAmount += n(item.refundAmount);
    row.netSales += n(item.netSales);
    row.orderCount += 1;
    row.sessions += n(item.sessions);
    row.pageViews += n(item.pageViews);
    row.averageSellingPrice = row.quantity ? row.netSales / row.quantity : 0;
    row.conversionRate = row.sessions ? row.quantity / row.sessions : 0;
    map.set(name, row);
  }
  return [...map.values()];
}
