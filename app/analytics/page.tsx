import Link from "next/link";
import { PageHeader, Panel } from "@/components/ui";

export default function AnalyticsModulePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="销售分析模块" description="独立完成报表导入、字段映射、销售汇总、产品排行和趋势分析。" />
      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="数据导入"><Link className="text-sm font-medium text-primary" href="/analytics/imports">上传亚马逊/领星报表</Link></Panel>
        <Panel title="销售看板"><Link className="text-sm font-medium text-primary" href="/analytics/sales">查看销售趋势和排行</Link></Panel>
        <Panel title="产品管理"><Link className="text-sm font-medium text-primary" href="/analytics/products">维护 SKU / ASIN</Link></Panel>
      </div>
    </div>
  );
}
