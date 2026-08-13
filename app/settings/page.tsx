import { PageHeader, Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [partners, stores] = await Promise.all([prisma.partner.findMany(), prisma.store.findMany()]);
  return (
    <div className="space-y-6">
      <PageHeader title="基础设置" description="总站级基础数据：合伙人、店铺和默认配置。" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="合伙人">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">姓名</th><th>股权比例</th><th>备注</th></tr></thead>
            <tbody>{partners.map((p) => <tr key={p.id} className="border-b"><td className="py-2">{p.name}</td><td>{p.equityRatio.toString()}%</td><td>{p.note}</td></tr>)}</tbody>
          </table>
        </Panel>
        <Panel title="店铺">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">店铺</th><th>站点</th><th>平台</th></tr></thead>
            <tbody>{stores.map((s) => <tr key={s.id} className="border-b"><td className="py-2">{s.name}</td><td>{s.marketplace}</td><td>{s.platform}</td></tr>)}</tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
