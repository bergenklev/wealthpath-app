"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function PriceHistoryChart({
  data,
}: {
  data: { date: string; price: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c8d6a" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#2c8d6a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6f0ea" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          domain={["auto", "auto"]}
          width={56}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#1f7256"
          fill="url(#priceFill)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
