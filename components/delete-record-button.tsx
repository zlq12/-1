"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteRecordButtonProps = {
  apiPath: "/api/investments" | "/api/expenses";
  id: string;
  label: string;
};

export function DeleteRecordButton({ apiPath, id, label }: DeleteRecordButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`确认删除这条${label}记录吗？删除后无法恢复。`);
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch(apiPath, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setLoading(false);

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      window.alert(payload?.error || "删除失败，请稍后重试。");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
      title={`删除${label}记录`}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {loading ? "删除中" : "删除"}
    </button>
  );
}
