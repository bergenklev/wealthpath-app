"use client";

import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useSettings } from "@/context/SettingsContext";
import { Card, StatCard } from "@/components/Card";
import { formatCurrency } from "@/lib/finance";
import { NEWS_ITEMS } from "@/lib/mockData";

// Mock household balance sheet snapshot. In a real app this would come from
// linked accounts (see README roadmap: open banking / Plaid-style aggregation).
const MOCK_ASSETS = {
  cash: 85_000,
  investments: 410_000,
  retirement: 260_000,
  homeValue: 3_200_000,
};
const MOCK_DEBTS = {
  mortgage: 2_150_000,
  carLoan: 95_000,
  creditCards: 8_500,
};

const NET_WORTH_TREND = [
  { month: "Jan", value: 1_480_000 },
  { month: "Feb", value: 1_502_000 },
  { month: "Mar", value: 1_489_000 },
  { month: "Apr", value: 1_531_000 },
  { month: "May", value: 1_558_000 },
  { month: "Jun", value: 1_596_000 },
  { month: "Jul", value: 1_601_500 },
];

export default function DashboardPage() {
  const { profile } = useSettings();
  const fmt = (v: number) => formatCurrency(v, profile.currency);

  const totalAssets =
    MOCK_ASSETS.cash +
    MOCK_ASSETS.investments +
    MOCK_ASSETS.retirement +
    MOCK_ASSETS.homeValue;
  const totalDebt =
    MOCK_DEBTS.mortgage + MOCK_DEBTS.carLoan + MOCK_DEBTS.creditCards;
  const netWorth = totalAssets - totalDebt;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">
          Good to see you 👋
        </h1>
        <p className="text-brand-500 text-sm mt-1">
          Here&apos;s a snapshot of your finances in {profile.label}.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Net worth" value={fmt(netWorth)} hint="+8.2% YTD" positive />
        <StatCard label="Total assets" value={fmt(totalAssets)} />
        <StatCard label="Total debt" value={fmt(totalDebt)} />
        <StatCard
          label="Est. monthly cash flow"
          value={fmt(18_400)}
          hint="After expenses & debt payments"
          positive
        />
      </div>

      <Card title="Net worth trend" subtitle="Last 7 months (mock data)">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={NET_WORTH_TREND}>
            <defs>
              <linearGradient id="nw" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c8d6a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2c8d6a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6f0ea" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              width={56}
            />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1f7256"
              fill="url(#nw)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Assets breakdown">
          <ul className="text-sm divide-y divide-brand-50">
            {Object.entries(MOCK_ASSETS).map(([key, value]) => (
              <li key={key} className="flex justify-between py-2">
                <span className="capitalize text-brand-700">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="font-medium">{fmt(value)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Debts breakdown">
          <ul className="text-sm divide-y divide-brand-50">
            {Object.entries(MOCK_DEBTS).map(([key, value]) => (
              <li key={key} className="flex justify-between py-2">
                <span className="capitalize text-brand-700">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="font-medium">{fmt(value)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Quick actions">
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/loans", label: "Price a loan" },
              { href: "/investments", label: "Project savings growth" },
              { href: "/goals", label: "Plan a purchase goal" },
              { href: "/markets", label: "Browse the markets" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-lg border border-brand-100 hover:border-brand-400 hover:bg-brand-50 transition-colors px-3 py-3 text-sm font-medium text-brand-800"
              >
                {a.label} →
              </Link>
            ))}
          </div>
        </Card>
        <Card title="Latest headlines" subtitle="See all on the News page">
          <ul className="space-y-3">
            {NEWS_ITEMS.slice(0, 3).map((n) => (
              <li key={n.id} className="text-sm">
                <p className="font-medium text-brand-900">{n.title}</p>
                <p className="text-brand-500 text-xs mt-0.5">
                  {n.source} &middot; {n.publishedAt}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href="/news"
            className="inline-block mt-3 text-sm text-brand-600 font-medium hover:underline"
          >
            View all news →
          </Link>
        </Card>
      </div>
    </div>
  );
}
