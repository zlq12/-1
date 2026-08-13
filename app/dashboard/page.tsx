import { RankingBarChart, SharePieChart, TrendChart } from "@/components/charts";
import { PageHeader, Panel, StatCard } from "@/components/ui";
import {
  calculateCashBalance,
  calculateExpenseByCategory,
  calculateMonthlySalesTrend,
  calculateProductSalesRanking,
  calculateSalesSummary,
  calculateTotalExpense,
  calculateTotalInvestment
} from "@/lib/calculations";
import { expenseCategoryLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { investments, expenses, sales, dbError } = await loadDashboardData();
  const salesSummary = calculateSalesSummary(sales);
  const expenseByCategory = calculateExpenseByCategory(expenses).map((item) => ({ ...item, name: expenseCategoryLabels[item.name] || item.name }));
  const salesTrend = calculateMonthlySalesTrend(sales);
  const productRanking = calculateProductSalesRanking(sales).slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="总览看板" description="汇总合伙资金、经营支出和销售数据，给总站首页使用。" />
      {dbError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          数据库暂时不可达，已显示空数据。Neon 免费实例可能正在冷启动，稍后刷新页面即可。
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="累计总投入" value={formatMoney(calculateTotalInvestment(investments))} />
        <StatCard label="累计总支出" value={formatMoney(calculateTotalExpense(expenses))} />
        <StatCard label="当前资金余额" value={formatMoney(calculateCashBalance(investments, expenses, sales))} />
        <StatCard label="累计净销售额" value={formatMoney(salesSummary.netSales, "USD")} />
        <StatCard label="累计销量" value={formatNumber(salesSummary.quantity)} />
        <StatCard label="产品数量" value={salesSummary.productCount} />
        <StatCard label="SKU 数量" value={salesSummary.skuCount} />
        <StatCard label="订单数" value={formatNumber(salesSummary.orderCount)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="月度销售额趋势">
          <TrendChart data={salesTrend} yKey="netSales" />
        </Panel>
        <Panel title="支出分类占比">
          <SharePieChart data={expenseByCategory} />
        </Panel>
        <Panel title="产品销售额排行">
          <RankingBarChart data={productRanking} yKey="netSales" />
        </Panel>
        <Panel title="月度销量趋势">
          <TrendChart data={salesTrend} yKey="quantity" />
        </Panel>
      </div>
    </div>
  );
}

async function loadDashboardData() {
  try {
    const [investments, expenses, sales] = await Promise.all([
      prisma.investment.findMany(),
      prisma.expense.findMany(),
      prisma.salesRecord.findMany()
    ]);
    return { investments, expenses, sales, dbError: false };
  } catch (error) {
    console.error("Dashboard database query failed", error);
    return { investments: [], expenses: [], sales: [], dbError: true };
  }
}
