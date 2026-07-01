"use client";

import { useMemo, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Card, Field, StatCard, inputClass } from "@/components/Card";
import GrowthChart from "@/components/GrowthChart";
import {
  projectGrowth,
  formatCurrency,
  formatPercent,
  estimateISKTax,
} from "@/lib/finance";

const RETURN_PRESETS = [
  { label: "Savings account (low risk)", value: 2 },
  { label: "Bond portfolio", value: 4 },
  { label: "Balanced (60/40 stocks/bonds)", value: 6 },
  { label: "Global stock index fund", value: 8 },
  { label: "Aggressive growth / individual stocks", value: 11 },
  { label: "Custom", value: -1 },
];

const SE_ACCOUNTS = [
  { id: "isk", label: "ISK (Investeringssparkonto)" },
  { id: "kf", label: "Kapitalförsäkring (KF)" },
  { id: "depa", label: "Aktie- & fonddepå (standard, capital gains tax)" },
];

const US_ACCOUNTS = [
  { id: "taxable", label: "Taxable brokerage" },
  { id: "401k", label: "401(k) (tax-deferred)" },
  { id: "roth", label: "Roth IRA (tax-free growth)" },
];

export default function InvestmentsPage() {
  const { profile, inflationEnabled, inflationRate, country } = useSettings();
  const [initialAmount, setInitialAmount] = useState(100_000);
  const [monthlyContribution, setMonthlyContribution] = useState(3_000);
  const [years, setYears] = useState(20);
  const [presetIdx, setPresetIdx] = useState(3);
  const [customReturn, setCustomReturn] = useState(7);
  const [localInflationEnabled, setLocalInflationEnabled] =
    useState(inflationEnabled);
  const [localInflationRate, setLocalInflationRate] = useState(
    inflationRate * 100
  );
  const [account, setAccount] = useState(country === "SE" ? "isk" : "taxable");

  const annualReturnPct =
    RETURN_PRESETS[presetIdx].value === -1
      ? customReturn
      : RETURN_PRESETS[presetIdx].value;

  const result = useMemo(
    () =>
      projectGrowth({
        initialAmount,
        monthlyContribution,
        annualReturnPct,
        years,
        inflationEnabled: localInflationEnabled,
        inflationRatePct: localInflationRate,
      }),
    [
      initialAmount,
      monthlyContribution,
      annualReturnPct,
      years,
      localInflationEnabled,
      localInflationRate,
    ]
  );

  const fmt = (v: number) => formatCurrency(v, profile.currency);
  const accounts = country === "SE" ? SE_ACCOUNTS : US_ACCOUNTS;

  const iskEstTax =
    country === "SE" && account === "isk"
      ? estimateISKTax(result.finalNominalValue)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">
          Investments &amp; savings growth
        </h1>
        <p className="text-brand-500 text-sm mt-1">
          Project how your savings could grow over time, in nominal and
          inflation-adjusted (real) terms.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Assumptions" className="lg:col-span-1">
          <Field label={`Starting amount (${profile.currency})`}>
            <input
              type="number"
              className={inputClass}
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
            />
          </Field>
          <Field label={`Monthly contribution (${profile.currency})`}>
            <input
              type="number"
              className={inputClass}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            />
          </Field>
          <Field label="Time horizon (years)">
            <input
              type="number"
              className={inputClass}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </Field>
          <Field label="Expected return / market">
            <select
              className={inputClass}
              value={presetIdx}
              onChange={(e) => setPresetIdx(Number(e.target.value))}
            >
              {RETURN_PRESETS.map((p, i) => (
                <option key={p.label} value={i}>
                  {p.label} {p.value !== -1 ? `(${p.value}%/yr)` : ""}
                </option>
              ))}
            </select>
          </Field>
          {RETURN_PRESETS[presetIdx].value === -1 && (
            <Field label="Custom annual return (%)">
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={customReturn}
                onChange={(e) => setCustomReturn(Number(e.target.value))}
              />
            </Field>
          )}
          <Field label={`Account type (${profile.label})`}>
            <select
              className={inputClass}
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
          <p className="text-xs text-brand-500 -mt-2 mb-3">{profile.taxAccountNote}</p>

          <div className="border-t border-brand-50 pt-3 mt-3">
            <label className="flex items-center gap-2 text-sm font-medium text-brand-800 mb-2">
              <input
                type="checkbox"
                checked={localInflationEnabled}
                onChange={(e) => setLocalInflationEnabled(e.target.checked)}
              />
              Adjust for inflation
            </label>
            {localInflationEnabled && (
              <Field label="Assumed inflation (% / year)">
                <input
                  type="number"
                  step="0.1"
                  className={inputClass}
                  value={localInflationRate}
                  onChange={(e) => setLocalInflationRate(Number(e.target.value))}
                />
              </Field>
            )}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard
              label="Final nominal value"
              value={fmt(result.finalNominalValue)}
            />
            {localInflationEnabled && (
              <StatCard
                label="Final real value (today's money)"
                value={fmt(result.finalRealValue)}
                hint="Purchasing-power adjusted"
              />
            )}
            <StatCard
              label="Total contributed"
              value={fmt(result.totalContributed)}
            />
            <StatCard
              label="Investment growth"
              value={fmt(result.totalGrowth)}
              positive
            />
          </div>

          {iskEstTax !== null && (
            <div className="rounded-lg bg-brand-50 border border-brand-100 p-3 text-sm text-brand-800">
              ℹ️ Estimated ISK schablonskatt in the final year on this balance:{" "}
              <strong>{fmt(iskEstTax)}</strong> (illustrative; based on a flat
              rate applied to the account balance rather than realized gains).
            </div>
          )}

          <Card title="Growth over time">
            <GrowthChart
              rows={result.rows}
              currencySymbol={profile.currencySymbol}
              showReal={localInflationEnabled}
            />
            <p className="text-xs text-brand-500 mt-2">
              Assumed return: {formatPercent(annualReturnPct)} / year
              {localInflationEnabled &&
                ` · Inflation: ${formatPercent(localInflationRate)} / year`}
              . Past performance does not guarantee future results.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
