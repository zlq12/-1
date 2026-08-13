"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { activeInvestmentTypes, expenseCategoryLabels, investmentTypeLabels } from "@/lib/labels";

export function InvestmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/investments", { method: "POST", body: formData });
    setLoading(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.error || "保存失败，请检查投资信息和支付图片。");
      return;
    }
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-3 md:grid-cols-4">
      <Input name="partnerName" placeholder="出资人姓名" required />
      <Select name="type">
        {activeInvestmentTypes.map((value) => (
          <option key={value} value={value}>
            {investmentTypeLabels[value]}
          </option>
        ))}
      </Select>
      <Input name="amount" type="number" step="0.01" placeholder="金额" required />
      <Select name="currency">
        <option value="CNY">CNY</option>
        <option value="USD">USD</option>
      </Select>
      <Input name="exchangeRate" type="number" step="0.0001" placeholder="汇率，人民币可空" />
      <Input name="date" type="date" required />
      <Input name="purpose" placeholder="用途" />
      <Input name="note" placeholder="备注" />
      <label className="space-y-1 text-sm md:col-span-4">
        <span className="text-muted-foreground">支付凭证图片</span>
        <Input name="paymentImage" type="file" accept="image/*" required />
      </label>
      {error ? <p className="text-sm text-red-600 md:col-span-4">{error}</p> : null}
      <Button disabled={loading} className="md:col-span-4">
        {loading ? "保存中" : "新增投资记录"}
      </Button>
    </form>
  );
}

export function ExpenseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/expenses", { method: "POST", body: formData });
    setLoading(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.error || "保存失败，请检查支出信息和支付图片。");
      return;
    }
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-3 md:grid-cols-4">
      <Input name="date" type="date" required />
      <Select name="category">
        {Object.entries(expenseCategoryLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Input name="amount" type="number" step="0.01" placeholder="金额" required />
      <Select name="currency">
        <option value="CNY">CNY</option>
        <option value="USD">USD</option>
      </Select>
      <Input name="exchangeRate" type="number" step="0.0001" placeholder="汇率，人民币可空" />
      <Input name="payer" placeholder="支出人姓名" required />
      <Input name="paymentAccount" placeholder="付款账户" />
      <Input name="relatedSku" placeholder="关联 SKU" />
      <Input name="relatedAsin" placeholder="关联 ASIN" />
      <Input name="supplier" placeholder="供应商" />
      <Input name="description" placeholder="支出说明" required />
      <Input name="note" placeholder="备注" />
      <label className="space-y-1 text-sm md:col-span-4">
        <span className="text-muted-foreground">支付凭证图片</span>
        <Input name="paymentImage" type="file" accept="image/*" required />
      </label>
      {error ? <p className="text-sm text-red-600 md:col-span-4">{error}</p> : null}
      <Button disabled={loading} className="md:col-span-4">
        {loading ? "保存中" : "新增支出记录"}
      </Button>
    </form>
  );
}

export function ImportUploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/imports", { method: "POST", body: formData });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok || !data?.id) {
      setError(data?.error || "解析失败，请检查文件格式。");
      return;
    }
    router.push(`/analytics/imports/${data.id}/mapping`);
  }

  return (
    <form action={submit} className="flex flex-col gap-3 sm:flex-row">
      <Input name="file" type="file" accept=".csv,.xlsx,.xls" required />
      <Button disabled={loading}>{loading ? "解析中" : "上传并解析"}</Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
