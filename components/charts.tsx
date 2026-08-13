"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#0f766e", "#2563eb", "#f59e0b", "#dc2626", "#7c3aed", "#059669", "#475569", "#db2777"];

export function TrendChart({ data, xKey = "month", yKey = "amount" }: { data: Record<string, unknown>[]; xKey?: string; yKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={xKey} fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Line type="monotone" dataKey={yKey} stroke="#0f766e" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RankingBarChart({ data, xKey = "name", yKey = "amount" }: { data: Record<string, unknown>[]; xKey?: string; yKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={xKey} fontSize={12} interval={0} angle={-12} height={58} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Bar dataKey={yKey} fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SharePieChart({ data, nameKey = "name", dataKey = "amount" }: { data: Record<string, unknown>[]; nameKey?: string; dataKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Tooltip />
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={58} outerRadius={92} paddingAngle={2}>
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
