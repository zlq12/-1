import { RankingBarChart, TrendChart } from "@/components/charts";
import { PageHeader, Panel, StatCard } from "@/components/ui";
import { calculateMonthlySalesTrend, calculateSalesSummary } from "@/lib/calculations";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return <PageHeader title="产品不存在" />;
  const records = await prisma.salesRecord.findMany({ where: { sku: product.sku }, orderBy: { date: "asc" } });
  const summary = calculateSalesSummary(records);
  const trend = calculateMonthlySalesTrend(records);
  return (
    <div className="space-y-6">
      <PageHeader title={product.childProductName || product.sku} description={`${product.sku} / ${product.asin || "无 ASIN"}`} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="净销售额" value={formatMoney(summary.netSales, "USD")} />
        <StatCard label="销量" value={formatNumber(summary.quantity)} />
        <StatCard label="订单数" value={formatNumber(summary.orderCount)} />
        <StatCard label="均价" value={formatMoney(summary.averageSellingPrice, "USD")} />
      </div>
      <Panel title="销售趋势"><TrendChart data={trend} yKey="netSales" /></Panel>
      <Panel title="月度销量"><RankingBarChart data={trend.map((item) => ({ name: item.month, quantity: item.quantity }))} yKey="quantity" /></Panel>
    </div>
  );
}
