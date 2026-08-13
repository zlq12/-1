import { MappingForm } from "@/components/mapping-form";
import { PageHeader, Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MappingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const batch = await prisma.importBatch.findUnique({ where: { id } });
  if (!batch) return <PageHeader title="导入批次不存在" />;
  const headers = Array.isArray(batch.originalHeaders) ? (batch.originalHeaders as string[]) : [];
  const mapping = (batch.mappingConfig || {}) as Record<string, string>;
  const previewRows = Array.isArray(batch.previewRows) ? (batch.previewRows as Record<string, unknown>[]) : [];
  return (
    <div className="space-y-6">
      <PageHeader title="字段映射" description={`${batch.fileName}，预览前 20 行，确认后写入标准销售数据表。`} />
      <Panel title="字段映射"><MappingForm batchId={id} headers={headers} mapping={mapping} /></Panel>
      <Panel title="数据预览">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-left text-muted-foreground">{headers.map((header) => <th key={header} className="whitespace-nowrap px-2 py-2">{header}</th>)}</tr></thead>
            <tbody>{previewRows.map((row, index) => <tr key={index} className="border-b">{headers.map((header) => <td key={header} className="whitespace-nowrap px-2 py-2">{String(row[header] ?? "")}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </Panel>
      {batch.errorMessage ? <Panel title="错误行"><pre className="whitespace-pre-wrap text-sm text-red-700">{batch.errorMessage}</pre></Panel> : null}
    </div>
  );
}
