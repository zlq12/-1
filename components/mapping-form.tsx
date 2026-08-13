"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Select } from "@/components/ui";
import { standardFields } from "@/lib/import/mapping";

const fieldLabels: Record<string, string> = {
  date: "销售日期",
  storeName: "店铺",
  marketplace: "站点",
  orderId: "订单号",
  parentProductName: "父产品",
  childProductName: "子产品",
  productName: "产品名称",
  sku: "SKU",
  asin: "ASIN",
  parentAsin: "父 ASIN",
  quantity: "销量",
  grossSales: "销售额",
  refundAmount: "退款金额",
  netSales: "净销售额",
  currency: "币种",
  sessions: "访问量",
  pageViews: "浏览量",
  conversionRate: "转化率"
};

export function MappingForm({ batchId, headers, mapping }: { batchId: string; headers: string[]; mapping: Record<string, string> }) {
  const router = useRouter();
  const [state, setState] = useState(mapping);
  const [strategy, setStrategy] = useState("skip");
  const [message, setMessage] = useState("");
  async function confirm() {
    const res = await fetch(`/api/imports/${batchId}/confirm`, { method: "POST", body: JSON.stringify({ mappingConfig: state, duplicateStrategy: strategy }) });
    const data = await res.json();
    setMessage(`导入完成：成功 ${data.successCount || 0} 行，失败 ${data.failedCount || 0} 行`);
    router.refresh();
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {standardFields.map((field) => (
          <label key={field} className="space-y-1 text-sm">
            <span className="text-muted-foreground">{fieldLabels[field] || field}</span>
            <Select value={state[field] || ""} onChange={(event) => setState((prev) => ({ ...prev, [field]: event.target.value }))}>
              <option value="">不映射</option>
              {headers.map((header) => <option key={header} value={header}>{header}</option>)}
            </Select>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Select value={strategy} onChange={(event) => setStrategy(event.target.value)}>
          <option value="skip">重复数据跳过</option>
          <option value="overwrite">重复数据覆盖</option>
          <option value="create_new">作为新数据导入</option>
        </Select>
        <Button onClick={confirm}>确认导入</Button>
      </div>
      {message ? <p className="text-sm text-primary">{message}</p> : null}
    </div>
  );
}
