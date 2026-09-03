"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Policy, Payment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#3b82f6", "#38bdf8", "#8b5cf6", "#22c55e", "#f59e0b"];

export function CoveragePie({ policies }: { policies: Policy[] }) {
  const byCat = new Map<string, number>();
  for (const p of policies) {
    byCat.set(p.category, (byCat.get(p.category) || 0) + Number(p.coverage || 0));
  }
  const data = Array.from(byCat, ([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return <Empty label="No coverage data yet" />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => formatCurrency(v)}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PaymentsArea({ payments }: { payments: Payment[] }) {
  const data = [...payments]
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .map((p) => ({ date: (p.date || "").slice(0, 10), amount: Number(p.amount || 0) }));

  if (data.length === 0) {
    return <Empty label="No payment history yet" />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} stroke="rgba(255,255,255,0.1)" />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} stroke="rgba(255,255,255,0.1)" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
        <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#payGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const tooltipStyle = {
  background: "hsl(222 44% 9%)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#fff",
  fontSize: 12,
};

function Empty({ label }: { label: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
