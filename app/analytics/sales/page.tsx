import { RankingBarChart, SharePieChart, TrendChart } from "@/components/charts";
import { PageHeader, Panel, StatCard } from "@/components/ui";
import { calculateChildProductShare, calculateMonthlySalesTrend, calculateProductSalesRanking, calculateSalesSummary, calculateSkuSalesRanking } from "@/lib/calculations";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const records = await prisma.salesRecord.findMany({ orderBy: { date: "desc" } });
  const summary = calculateSalesSummary(records);
  const trend = calculateMonthlySalesTrend(records);
  const productRanking = calculateProductSalesRanking(records).slice(0, 10);
  const skuRanking = calculateSkuSalesRanking(records).slice(0, 10);
  const childShare = calculateChildProductShare(records).slice(0, 8).map((item) => ({ ...item, amount: item.netSales }));
  return (
    <div className="space-y-6">
      <PageHeader title="销售分析" description="从导入的销售记录中查看趋势、产品排行、SKU 表现和子产品占比。" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="累计销售额" value={formatMoney(summary.grossSales, "USD")} />
        <StatCard label="净销售额" value={formatMoney(summary.netSales, "USD")} />
        <StatCard label="累计销量" value={formatNumber(summary.quantity)} />
        <StatCard label="SKU 数量" value={summary.skuCount} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="月度净销售额趋势"><TrendChart data={trend} yKey="netSales" /></Panel>
        <Panel title="产品销售额 Top 10"><RankingBarChart data={productRanking} yKey="netSales" /></Panel>
        <Panel title="SKU 销量 Top 10"><RankingBarChart data={skuRanking} yKey="quantity" /></Panel>
        <Panel title="子产品销售额占比"><SharePieChart data={childShare} /></Panel>
      </div>
    </div>
  );
}
