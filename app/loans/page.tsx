"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useSettings } from "@/context/SettingsContext";
import { Card, Field, inputClass } from "@/components/Card";
import {
  calculateMortgage,
  calculatePrivateLoan,
  formatCurrency,
  formatPercent,
} from "@/lib/finance";

type Tab = "mortgage" | "private";

const COLORS = ["#2c8d6a", "#d7f0e5"];

export default function LoansPage() {
  const { country, profile } = useSettings();
  const [tab, setTab] = useState<Tab>("mortgage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">Loans</h1>
        <p className="text-brand-500 text-sm mt-1">
          Price a mortgage or a private loan and see the full repayment
          breakdown, using {profile.label} conventions.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-brand-100 bg-white p-1 text-sm">
        <button
          onClick={() => setTab("mortgage")}
          className={`px-4 py-1.5 rounded-md ${
            tab === "mortgage" ? "bg-brand-600 text-white" : "text-brand-700"
          }`}
        >
          Mortgage
        </button>
        <button
          onClick={() => setTab("private")}
          className={`px-4 py-1.5 rounded-md ${
            tab === "private" ? "bg-brand-600 text-white" : "text-brand-700"
          }`}
        >
          Private / personal loan
        </button>
      </div>

      {tab === "mortgage" ? (
        <MortgageCalculator currency={profile.currency} country={country} />
      ) : (
        <PrivateLoanCalculator currency={profile.currency} />
      )}
    </div>
  );
}

function MortgageCalculator({
  currency,
  country,
}: {
  currency: string;
  country: "SE" | "US";
}) {
  const [homePrice, setHomePrice] = useState(4_200_000);
  const [downPayment, setDownPayment] = useState(630_000);
  const [rate, setRate] = useState(3.8);
  const [years, setYears] = useState(30);
  const [income, setIncome] = useState(650_000);

  const result = useMemo(
    () =>
      calculateMortgage({
        homePrice,
        downPayment,
        annualRatePct: rate,
        years,
        country,
        householdIncomeAnnual: income,
      }),
    [homePrice, downPayment, rate, years, country, income]
  );

  const fmt = (v: number) => formatCurrency(v, currency);
  const pieData = [
    { name: "Principal", value: result.loanAmount },
    { name: "Total interest", value: result.totalInterest },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card title="Loan details" className="lg:col-span-1">
        <Field label={`Home price (${currency})`}>
          <input
            type="number"
            className={inputClass}
            value={homePrice}
            onChange={(e) => setHomePrice(Number(e.target.value))}
          />
        </Field>
        <Field label={`Down payment (${currency})`}>
          <input
            type="number"
            className={inputClass}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
          />
        </Field>
        <Field label="Interest rate (% / year)">
          <input
            type="number"
            step="0.01"
            className={inputClass}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </Field>
        <Field label="Loan term (years)">
          <input
            type="number"
            className={inputClass}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
          />
        </Field>
        {country === "SE" && (
          <Field label={`Gross household income (${currency}/year)`}>
            <input
              type="number"
              className={inputClass}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
            />
          </Field>
        )}
      </Card>

      <Card title="Results" className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Stat label="Loan amount" value={fmt(result.loanAmount)} />
          <Stat
            label="Loan-to-value"
            value={formatPercent(result.loanToValue * 100)}
          />
          <Stat
            label="Monthly payment (amortizing)"
            value={fmt(result.monthlyPayment)}
          />
          {result.requiredAmortizationMonthly !== null && (
            <Stat
              label="Legal minimum amortization / month"
              value={fmt(result.requiredAmortizationMonthly)}
            />
          )}
          <Stat label="Total interest over term" value={fmt(result.totalInterest)} />
          <Stat label="Total paid over term" value={fmt(result.totalPaid)} />
        </div>

        {result.notes.length > 0 && (
          <div className="rounded-lg bg-brand-50 border border-brand-100 p-3 mb-4 text-sm text-brand-800 space-y-1">
            {result.notes.map((n, i) => (
              <p key={i}>ℹ️ {n}</p>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 items-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <ScheduleTable rows={result.schedule} currency={currency} />
        </div>
      </Card>
    </div>
  );
}

function PrivateLoanCalculator({ currency }: { currency: string }) {
  const [loanAmount, setLoanAmount] = useState(150_000);
  const [rate, setRate] = useState(6.9);
  const [years, setYears] = useState(5);
  const [setupFee, setSetupFee] = useState(500);
  const [monthlyFee, setMonthlyFee] = useState(35);

  const result = useMemo(
    () =>
      calculatePrivateLoan({
        loanAmount,
        annualRatePct: rate,
        years,
        setupFee,
        monthlyFee,
      }),
    [loanAmount, rate, years, setupFee, monthlyFee]
  );

  const fmt = (v: number) => formatCurrency(v, currency);
  const pieData = [
    { name: "Principal", value: loanAmount },
    { name: "Interest + fees", value: result.totalCost },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card
        title="Loan details"
        subtitle="Car loans, personal/consumer loans, renovation loans, etc."
        className="lg:col-span-1"
      >
        <Field label={`Loan amount (${currency})`}>
          <input
            type="number"
            className={inputClass}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
          />
        </Field>
        <Field label="Interest rate (% / year)">
          <input
            type="number"
            step="0.01"
            className={inputClass}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </Field>
        <Field label="Term (years)">
          <input
            type="number"
            className={inputClass}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
          />
        </Field>
        <Field label={`One-time setup fee (${currency})`}>
          <input
            type="number"
            className={inputClass}
            value={setupFee}
            onChange={(e) => setSetupFee(Number(e.target.value))}
          />
        </Field>
        <Field label={`Monthly admin fee (${currency})`}>
          <input
            type="number"
            className={inputClass}
            value={monthlyFee}
            onChange={(e) => setMonthlyFee(Number(e.target.value))}
          />
        </Field>
      </Card>

      <Card title="Results" className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Stat label="Monthly payment" value={fmt(result.monthlyPayment)} />
          <Stat
            label="Effective rate (incl. fees)"
            value={formatPercent(result.effectiveAnnualRatePct)}
          />
          <Stat label="Total interest" value={fmt(result.totalInterest)} />
          <Stat label="Total fees" value={fmt(result.totalFees)} />
          <Stat
            label="Total cost of credit"
            value={fmt(result.totalCost)}
            className="sm:col-span-2"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 items-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <ScheduleTable rows={result.schedule} currency={currency} />
        </div>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wide text-brand-500">{label}</p>
      <p className="text-lg font-semibold text-brand-900">{value}</p>
    </div>
  );
}

function ScheduleTable({
  rows,
  currency,
}: {
  rows: { month: number; payment: number; interestPaid: number; balance: number }[];
  currency: string;
}) {
  const fmt = (v: number) => formatCurrency(v, currency);
  // Show first 3 months, then every 12th month, to keep it readable
  const preview = rows.filter(
    (r) => r.month <= 3 || r.month % 12 === 0
  );

  return (
    <div className="max-h-[200px] overflow-auto rounded-lg border border-brand-100">
      <table className="w-full text-xs">
        <thead className="bg-brand-50 sticky top-0">
          <tr className="text-left text-brand-600">
            <th className="px-2 py-1.5">Month</th>
            <th className="px-2 py-1.5">Payment</th>
            <th className="px-2 py-1.5">Interest</th>
            <th className="px-2 py-1.5">Balance</th>
          </tr>
        </thead>
        <tbody>
          {preview.map((r) => (
            <tr key={r.month} className="border-t border-brand-50">
              <td className="px-2 py-1.5">{r.month}</td>
              <td className="px-2 py-1.5">{fmt(r.payment)}</td>
              <td className="px-2 py-1.5">{fmt(r.interestPaid)}</td>
              <td className="px-2 py-1.5">{fmt(r.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
