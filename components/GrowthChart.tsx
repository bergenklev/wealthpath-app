"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { GrowthYearRow } from "@/lib/finance";

export default function GrowthChart({
  rows,
  currencySymbol,
  showReal,
}: {
  rows: GrowthYearRow[];
  currencySymbol: string;
  showReal: boolean;
}) {
  const data = rows.map((r) => ({
    year: `Y${r.year}`,
    Contributed: Math.round(r.contributed),
    Nominal: Math.round(r.nominalValue),
    Real: Math.round(r.realValue),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6f0ea" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `${currencySymbol}${Math.round(v / 1000)}k`}
          width={64}
        />
        <Tooltip
          formatter={(value: number) =>
            `${currencySymbol}${value.toLocaleString()}`
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Contributed"
          stroke="#94a3b8"
          strokeDasharray="4 4"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Nominal"
          stroke="#2c8d6a"
          strokeWidth={2}
          dot={false}
        />
        {showReal && (
          <Line
            type="monotone"
            dataKey="Real"
            stroke="#1f7256"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
