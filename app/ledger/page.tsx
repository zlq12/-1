import Link from "next/link";
import { PageHeader, Panel } from "@/components/ui";

export default function LedgerModulePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="合伙记账模块" description="独立管理投资、垫付、还款、分红和支出，后续可直接挂到总站模块入口。" />
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="投资管理">
          <p className="mb-4 text-sm text-muted-foreground">记录两位合伙人的初始投资、追加投资、垫付、借款、还款、分红和提现。</p>
          <Link className="text-sm font-medium text-primary" href="/ledger/investments">进入投资管理</Link>
        </Panel>
        <Panel title="支出管理">
          <p className="mb-4 text-sm text-muted-foreground">按采购、物流、广告、FBA、软件等分类记录每一笔经营支出。</p>
          <Link className="text-sm font-medium text-primary" href="/ledger/expenses">进入支出管理</Link>
        </Panel>
      </div>
    </div>
  );
}
