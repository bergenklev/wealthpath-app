"use client";

import { useEffect, useState } from "react";
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
import EditableLineItems, { LineItem } from "@/components/EditableLineItems";
import { formatCurrency } from "@/lib/finance";
import { NEWS_ITEMS } from "@/lib/mockData";

// Starting example figures — every value here is editable in the UI and
// persisted to the browser's local storage, so this is just a first-run
// default rather than fixed data. In a production app this would instead
// be seeded from linked accounts (see README: open banking / Plaid-style
// aggregation).
const DEFAULT_ASSETS: LineItem[] = [
  { id: "cash", label: "Cash", value: 85_000 },
  { id: "investments", label: "Investments", value: 410_000 },
  { id: "retirement", label: "Retirement", value: 260_000 },
  { id: "homeValue", label: "Home value", value: 3_200_000 },
];
const DEFAULT_DEBTS: LineItem[] = [
  { id: "mortgage", label: "Mortgage", value: 2_150_000 },
  { id: "carLoan", label: "Car loan", value: 95_000 },
  { id: "creditCards", label: "Credit cards", value: 8_500 },
];
const DEFAULT_CASH_FLOW = 18_400;

const NET_WORTH_TREND_HISTORY = [
  { month: "Jan", value: 1_480_000 },
  { month: "Feb", value: 1_502_000 },
  { month: "Mar", value: 1_489_000 },
  { month: "Apr", value: 1_531_000 },
  { month: "May", value: 1_558_000 },
  { month: "Jun", value: 1_596_000 },
];

const ASSETS_KEY = "pwm-assets-v1";
const DEBTS_KEY = "pwm-debts-v1";
const CASH_FLOW_KEY = "pwm-cashflow-v1";

function useLocalStorageList(key: string, fallback: LineItem[]) {
  const [items, setItems] = useState<LineItem[]>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(key, JSON.stringify(items));
  }, [items, hydrated, key]);

  return [items, setItems] as const;
}

export default function DashboardPage() {
  const { profile } = useSettings();
  const fmt = (v: number) => formatCurrency(v, profile.currency);

  const [assets, setAssets] = useLocalStorageList(ASSETS_KEY, DEFAULT_ASSETS);
  const [debts, setDebts] = useLocalStorageList(DEBTS_KEY, DEFAULT_DEBTS);
  const [cashFlow, setCashFlow] = useState(DEFAULT_CASH_FLOW);
  const [cashFlowHydrated, setCashFlowHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CASH_FLOW_KEY);
      if (raw) setCashFlow(Number(raw));
    } catch {
      // ignore
    }
    setCashFlowHydrated(true);
  }, []);

  useEffect(() => {
    if (!cashFlowHydrated) return;
    window.localStorage.setItem(CASH_FLOW_KEY, String(cashFlow));
  }, [cashFlow, cashFlowHydrated]);

  const totalAssets = assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const totalDebt = debts.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const netWorth = totalAssets - totalDebt;

  const netWorthTrend = [
    ...NET_WORTH_TREND_HISTORY,
    { month: "Now", value: netWorth },
  ];

  const resetToExample = () => {
    setAssets(DEFAULT_ASSETS);
    setDebts(DEFAULT_DEBTS);
    setCashFlow(DEFAULT_CASH_FLOW);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">
            Good to see you 👋
          </h1>
          <p className="text-brand-500 text-sm mt-1">
            Here&apos;s a snapshot of your finances in {profile.label}. All
            figures below are yours to edit — they&apos;re saved in this
            browser.
          </p>
        </div>
        <button
          onClick={resetToExample}
          className="shrink-0 text-xs text-brand-500 hover:text-brand-700 hover:underline"
        >
          Reset to example data
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Net worth" value={fmt(netWorth)} hint="Assets minus debts" />
        <StatCard label="Total assets" value={fmt(totalAssets)} />
        <StatCard label="Total debt" value={fmt(totalDebt)} />
        <StatCard
          label="Est. monthly cash flow"
          value={fmt(cashFlow)}
          hint="After expenses & debt payments"
          positive={cashFlow >= 0}
        />
      </div>

      <Card title="Net worth trend" subtitle="Last 6 months are illustrative sample history; “Now” reflects your current figures">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={netWorthTrend}>
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
        <Card
          title="Assets breakdown"
          subtitle="Edit labels and amounts, or add your own"
        >
          <EditableLineItems
            items={assets}
            currency={profile.currency}
            onChange={setAssets}
            addLabel="+ Add asset"
          />
        </Card>
        <Card
          title="Debts breakdown"
          subtitle="Edit labels and amounts, or add your own"
        >
          <EditableLineItems
            items={debts}
            currency={profile.currency}
            onChange={setDebts}
            addLabel="+ Add debt"
          />
        </Card>
      </div>

      <Card title="Monthly cash flow" className="max-w-sm">
        <label className="block text-sm font-medium text-brand-800 mb-1">
          Estimated cash left over each month
        </label>
        <input
          type="number"
          value={cashFlow}
          onChange={(e) => setCashFlow(Number(e.target.value))}
          className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </Card>

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
