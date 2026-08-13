import Link from "next/link";
import { ImportUploadForm } from "@/components/record-form";
import { PageHeader, Panel } from "@/components/ui";
import { importSourceLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ImportsPage() {
  const batches = await prisma.importBatch.findMany({ orderBy: { uploadedAt: "desc" }, take: 20 });
  return (
    <div className="space-y-6">
      <PageHeader title="数据导入" description="上传亚马逊后台、广告报表或领星 ERP 导出的 CSV / Excel 文件。" />
      <Panel title="上传文件"><ImportUploadForm /></Panel>
      <Panel title="导入历史">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">文件</th><th>来源</th><th>状态</th><th>行数</th><th>成功</th><th>失败</th><th>操作</th></tr></thead>
            <tbody>{batches.map((batch) => <tr key={batch.id} className="border-b"><td className="py-2">{batch.fileName}</td><td>{importSourceLabels[batch.source]}</td><td>{batch.status}</td><td>{batch.rowCount}</td><td>{batch.successCount}</td><td>{batch.failedCount}</td><td><Link className="text-primary" href={`/analytics/imports/${batch.id}/mapping`}>映射</Link></td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
