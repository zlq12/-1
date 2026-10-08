import Link from "next/link";
import { RankingBarChart, SharePieChart, TrendChart } from "@/components/charts";
import { DeleteRecordButton } from "@/components/delete-record-button";
import { ExpenseForm } from "@/components/record-form";
import { PageHeader, Panel, StatCard } from "@/components/ui";
import { expenseCategoryLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [expenses, totalResult, recordCount, categoryRows] = await Promise.all([
    prisma.expense.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 10
    }),
    prisma.expense.aggregate({
      _sum: { amountInBaseCurrency: true }
    }),
    prisma.expense.count(),
    prisma.expense.groupBy({
      by: ["category"],
      _sum: { amountInBaseCurrency: true },
      orderBy: { _sum: { amountInBaseCurrency: "desc" } }
    })
  ]);
  const total = Number(totalResult._sum.amountInBaseCurrency || 0);
  const byCategory = categoryRows.map((item) => ({
    name: expenseCategoryLabels[item.category] || item.category,
    amount: Number(item._sum.amountInBaseCurrency || 0)
  }));
  const trend = expenses
    .slice()
    .reverse()
    .map((item) => ({
      month: item.date.toISOString().slice(0, 10),
      amount: Number(item.amountInBaseCurrency || 0),
      name: "支出"
    }));

  return (
    <div className="space-y-6">
      <PageHeader title="支出管理" description="记录经营支出，并按分类、月份和支出人查看费用结构。每笔支出都需要上传支付凭证图片。" />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="累计总支出" value={formatMoney(total)} />
        <StatCard label="支出记录数" value={recordCount} />
        <StatCard label="支出分类数" value={byCategory.length} />
      </div>
      <Panel title="新增支出记录">
        <ExpenseForm />
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="支出分类占比">
          <SharePieChart data={byCategory} />
        </Panel>
      <Panel title="最近 10 条支出趋势">
          <TrendChart data={trend} />
        </Panel>
        <Panel title="支出分类排行" className="lg:col-span-2">
          <RankingBarChart data={byCategory} />
        </Panel>
      </div>
      <Panel title="最近 10 条支出明细">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">日期</th>
                <th>分类</th>
                <th>金额</th>
                <th>支出人</th>
                <th>SKU</th>
                <th>说明</th>
                <th>凭证</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.date.toISOString().slice(0, 10)}</td>
                  <td>{expenseCategoryLabels[item.category]}</td>
                  <td>{formatMoney(item.amountInBaseCurrency.toString())}</td>
                  <td>{item.payer}</td>
                  <td>{item.relatedSku}</td>
                  <td>{item.description}</td>
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
                    <DeleteRecordButton apiPath="/api/expenses" id={item.id} label="支出" />
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
