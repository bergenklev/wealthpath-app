"use client";

import { useMemo, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Card, Field, StatCard, inputClass } from "@/components/Card";
import {
  calculateGoalSavings,
  formatCurrency,
  formatPercent,
} from "@/lib/finance";

const PRESETS = [
  { label: "Luxury watch", amount: 45_000, years: 2 },
  { label: "Trip abroad", amount: 30_000, years: 1 },
  { label: "Used car", amount: 180_000, years: 3 },
  { label: "House down payment", amount: 700_000, years: 5 },
  { label: "Emergency fund (3 months expenses)", amount: 90_000, years: 1 },
  { label: "Custom goal", amount: 20_000, years: 2 },
];

export default function GoalsPage() {
  const { profile, inflationEnabled, inflationRate } = useSettings();
  const [presetIdx, setPresetIdx] = useState(0);
  const [goalName, setGoalName] = useState(PRESETS[0].label);
  const [targetAmountToday, setTargetAmountToday] = useState(
    PRESETS[0].amount
  );
  const [years, setYears] = useState(PRESETS[0].years);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [annualReturnPct, setAnnualReturnPct] = useState(4);
  const [localInflationEnabled, setLocalInflationEnabled] =
    useState(inflationEnabled);
  const [localInflationRate, setLocalInflationRate] = useState(
    inflationRate * 100
  );

  const applyPreset = (idx: number) => {
    setPresetIdx(idx);
    setGoalName(PRESETS[idx].label);
    setTargetAmountToday(PRESETS[idx].amount);
    setYears(PRESETS[idx].years);
  };

  const result = useMemo(
    () =>
      calculateGoalSavings({
        targetAmountToday,
        years,
        annualReturnPct,
        currentSavings,
        inflationEnabled: localInflationEnabled,
        inflationRatePct: localInflationRate,
      }),
    [
      targetAmountToday,
      years,
      annualReturnPct,
      currentSavings,
      localInflationEnabled,
      localInflationRate,
    ]
  );

  // Comparison: saving in cash (0% return) for the same inflated target
  const cashResult = useMemo(
    () =>
      calculateGoalSavings({
        targetAmountToday,
        years,
        annualReturnPct: 0,
        currentSavings,
        inflationEnabled: localInflationEnabled,
        inflationRatePct: localInflationRate,
      }),
    [
      targetAmountToday,
      years,
      currentSavings,
      localInflationEnabled,
      localInflationRate,
    ]
  );

  const fmt = (v: number) => formatCurrency(v, profile.currency);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">
          Save for something specific
        </h1>
        <p className="text-brand-500 text-sm mt-1">
          Pick a product or experience and see exactly how much to set aside
          each month to afford it.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => applyPreset(i)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              presetIdx === i
                ? "bg-brand-600 text-white border-brand-600"
                : "border-brand-200 text-brand-700 bg-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Your goal" className="lg:col-span-1">
          <Field label="Goal name">
            <input
              type="text"
              className={inputClass}
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />
          </Field>
          <Field label={`Price today (${profile.currency})`}>
            <input
              type="number"
              className={inputClass}
              value={targetAmountToday}
              onChange={(e) => setTargetAmountToday(Number(e.target.value))}
            />
          </Field>
          <Field label="Time until purchase (years)">
            <input
              type="number"
              step="0.25"
              className={inputClass}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </Field>
          <Field label={`Savings already set aside (${profile.currency})`}>
            <input
              type="number"
              className={inputClass}
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
            />
          </Field>
          <Field label="Expected annual return while saving (%)">
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={annualReturnPct}
              onChange={(e) => setAnnualReturnPct(Number(e.target.value))}
            />
          </Field>

          <div className="border-t border-brand-50 pt-3 mt-3">
            <label className="flex items-center gap-2 text-sm font-medium text-brand-800 mb-2">
              <input
                type="checkbox"
                checked={localInflationEnabled}
                onChange={(e) => setLocalInflationEnabled(e.target.checked)}
              />
              Adjust the price for inflation
            </label>
            {localInflationEnabled && (
              <Field label="Assumed inflation (% / year)">
                <input
                  type="number"
                  step="0.1"
                  className={inputClass}
                  value={localInflationRate}
                  onChange={(e) =>
                    setLocalInflationRate(Number(e.target.value))
                  }
                />
              </Field>
            )}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card title={`Plan: ${goalName}`}>
            <div className="grid sm:grid-cols-2 gap-4">
              <StatCard
                label="Required monthly savings"
                value={fmt(result.requiredMonthlySavings)}
                hint={
                  localInflationEnabled
                    ? "Investing at your expected return, inflation-adjusted price"
                    : "Investing at your expected return"
                }
                positive
              />
              <StatCard
                label={
                  localInflationEnabled
                    ? "Future price (inflation-adjusted)"
                    : "Target price"
                }
                value={fmt(result.inflatedTargetAmount)}
              />
              <StatCard
                label="Total you'll contribute"
                value={fmt(result.totalContributions)}
              />
              <StatCard
                label="Growth from investing"
                value={fmt(result.totalGrowth)}
              />
            </div>
          </Card>

          <Card
            title="Investing vs. saving in cash"
            subtitle="Same goal, 0% return if you just keep cash under the mattress"
          >
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-brand-100 p-3">
                <p className="font-medium text-brand-900 mb-1">
                  Investing at {formatPercent(annualReturnPct)}/yr
                </p>
                <p className="text-2xl font-semibold text-brand-700">
                  {fmt(result.requiredMonthlySavings)}
                  <span className="text-sm font-normal text-brand-500">
                    {" "}
                    / month
                  </span>
                </p>
              </div>
              <div className="rounded-lg border border-brand-100 p-3">
                <p className="font-medium text-brand-900 mb-1">
                  Saving in cash (0%/yr)
                </p>
                <p className="text-2xl font-semibold text-brand-700">
                  {fmt(cashResult.requiredMonthlySavings)}
                  <span className="text-sm font-normal text-brand-500">
                    {" "}
                    / month
                  </span>
                </p>
              </div>
            </div>
            <p className="text-xs text-brand-500 mt-3">
              Investing instead of holding cash means you need to save{" "}
              {fmt(
                Math.max(
                  0,
                  cashResult.requiredMonthlySavings -
                    result.requiredMonthlySavings
                )
              )}{" "}
              less per month toward this goal — but your balance can also go
              down as well as up along the way.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
