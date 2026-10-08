import Link from "next/link";
import { DeleteRecordButton } from "@/components/delete-record-button";
import { InvestmentForm } from "@/components/record-form";
import { PageHeader, Panel, StatCard } from "@/components/ui";
import { investmentTypeLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage() {
  const [investments, groupedByType, groupedByPartner, recordCount, distinctPartners] = await Promise.all([
    prisma.investment.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 10
    }),
    prisma.investment.groupBy({
      by: ["type"],
      _sum: { amountInBaseCurrency: true }
    }),
    prisma.investment.groupBy({
      by: ["partnerName", "type"],
      _sum: { amountInBaseCurrency: true },
      orderBy: { partnerName: "asc" }
    }),
    prisma.investment.count(),
    prisma.investment.findMany({
      select: { partnerName: true },
      distinct: ["partnerName"]
    })
  ]);

  const realInvestment = sumByType(groupedByType, "initial_investment");
  const returnInvestment = sumByType(groupedByType, "additional_investment");
  const totalInvestment = realInvestment + returnInvestment;
  const balances = buildPartnerInvestmentRows(groupedByPartner);
  const partnerCount = distinctPartners.length;

  return (
    <div className="space-y-6">
      <PageHeader title="投资管理" description="当前只记录初始投资和回款投入。初始投资计入真实总投入，回款投入计入累计总投入。" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="真实总投入" value={formatMoney(realInvestment)} hint="只统计初始投资" />
        <StatCard label="回款投入" value={formatMoney(returnInvestment)} hint="经营回款再次投入" />
        <StatCard label="累计总投入" value={formatMoney(totalInvestment)} hint="初始投资 + 回款投入" />
        <StatCard label="资金记录数" value={recordCount} hint={`出资人 ${partnerCount} 位`} />
      </div>
      <Panel title="新增投资记录">
        <InvestmentForm />
      </Panel>
      <Panel title="出资人汇总">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">出资人</th>
                <th>初始投资</th>
                <th>回款投入</th>
                <th>累计投入</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((row) => (
                <tr key={row.partnerName} className="border-b">
                  <td className="py-2">{row.partnerName}</td>
                  <td>{formatMoney(row.initialInvestment)}</td>
                  <td>{formatMoney(row.returnInvestment)}</td>
                  <td>{formatMoney(row.totalInvestment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="最近 10 条投资明细">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">日期</th>
                <th>出资人</th>
                <th>类型</th>
                <th>金额</th>
                <th>折算 CNY</th>
                <th>用途</th>
                <th>备注</th>
                <th>凭证</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.date.toISOString().slice(0, 10)}</td>
                  <td>{item.partnerName}</td>
                  <td>{investmentTypeLabels[item.type]}</td>
                  <td>{formatMoney(item.amount.toString(), item.currency)}</td>
                  <td>{formatMoney(item.amountInBaseCurrency.toString())}</td>
                  <td>{item.purpose}</td>
                  <td>{item.note}</td>
                  <td>
                    {item.attachmentUrl ? (
                      <Link className="text-primary" href={item.attachmentUrl} target="_blank">
                        查看凭证
                      </Link>
                    ) : (
                      <span className="text-red-600">缺少</span>
                    )}
                  </td>
                  <td>
                    <DeleteRecordButton apiPath="/api/investments" id={item.id} label="投资" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function sumByType(rows: { type: string; _sum: { amountInBaseCurrency: unknown } }[], type: string) {
  return rows
    .filter((row) => row.type === type)
    .reduce((sum, row) => sum + Number(row._sum.amountInBaseCurrency || 0), 0);
}

function buildPartnerInvestmentRows(rows: { partnerName: string; type: string; _sum: { amountInBaseCurrency: unknown } }[]) {
  const map = new Map<string, { partnerName: string; initialInvestment: number; returnInvestment: number; totalInvestment: number }>();
  for (const row of rows) {
    const current = map.get(row.partnerName) || {
      partnerName: row.partnerName,
      initialInvestment: 0,
      returnInvestment: 0,
      totalInvestment: 0
    };
    const amount = Number(row._sum.amountInBaseCurrency || 0);
    if (row.type === "initial_investment") current.initialInvestment += amount;
    if (row.type === "additional_investment") current.returnInvestment += amount;
    current.totalInvestment = current.initialInvestment + current.returnInvestment;
    map.set(row.partnerName, current);
  }
  return [...map.values()];
}
