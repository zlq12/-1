import Link from "next/link";
import { PageHeader, Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div className="space-y-6">
      <PageHeader title="产品管理" description="导入销售数据时会自动创建产品，也可以后续扩展为手工维护。" />
      <Panel title="SKU / ASIN 列表">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">父产品</th><th>子产品</th><th>SKU</th><th>ASIN</th><th>站点</th><th>店铺</th></tr></thead>
            <tbody>{products.map((p) => <tr key={p.id} className="border-b"><td className="py-2"><Link className="text-primary" href={`/analytics/products/${p.id}`}>{p.parentProductName || p.childProductName || p.sku}</Link></td><td>{p.childProductName}</td><td>{p.sku}</td><td>{p.asin}</td><td>{p.marketplace}</td><td>{p.storeName}</td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
