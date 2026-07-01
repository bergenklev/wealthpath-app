"use client";

import { useMemo, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Card, Field, StatCard, inputClass } from "@/components/Card";
import {
  calculateGoalSavings,
  formatCurrency,
  formatPercent,
} from "@/lib/finance";
import {
  CATEGORY_DEFAULT_YEARS,
  PRODUCT_CATEGORIES,
  Product,
  ProductCategory,
  convertFromUSD,
  getProductsByCategory,
} from "@/lib/products";

type TabId = ProductCategory | "custom";

const TABS: { id: TabId; label: string }[] = [
  ...PRODUCT_CATEGORIES.map((c) => ({ id: c.id as TabId, label: c.label })),
  { id: "custom", label: "Custom" },
];

export default function GoalsPage() {
  const { profile, inflationEnabled, inflationRate } = useSettings();
  const [activeTab, setActiveTab] = useState<TabId>("watches");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const [goalName, setGoalName] = useState("My savings goal");
  const [targetAmountToday, setTargetAmountToday] = useState(20_000);
  const [years, setYears] = useState(2);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [annualReturnPct, setAnnualReturnPct] = useState(4);
  const [localInflationEnabled, setLocalInflationEnabled] =
    useState(inflationEnabled);
  const [localInflationRate, setLocalInflationRate] = useState(
    inflationRate * 100
  );

  const fmt = (v: number) => formatCurrency(v, profile.currency);

  const applyProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setGoalName(`${product.brand} ${product.model}`);
    setTargetAmountToday(convertFromUSD(product.priceUSD, profile.currency));
    setYears(CATEGORY_DEFAULT_YEARS[product.category]);
  };

  const productsInTab =
    activeTab === "custom" ? [] : getProductsByCategory(activeTab);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">
          Save for something specific
        </h1>
        <p className="text-brand-500 text-sm mt-1">
          Browse real brands and models, or type your own — then see exactly
          how much to set aside each month to afford it.
        </p>
      </div>

      <Card title="Browse products" subtitle="Prices are approximate and illustrative">
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                activeTab === tab.id
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-brand-200 text-brand-700 bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "custom" ? (
          <p className="text-sm text-brand-500">
            Type your own goal name and price in the form below.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {productsInTab.map((product) => {
              const price = convertFromUSD(product.priceUSD, profile.currency);
              const selected = product.id === selectedProductId;
              return (
                <button
                  key={product.id}
                  onClick={() => applyProduct(product)}
                  className={`shrink-0 w-44 text-left rounded-xl border p-3 transition-colors ${
                    selected
                      ? "border-brand-600 bg-brand-50 ring-1 ring-brand-400"
                      : "border-brand-100 bg-white hover:border-brand-300"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-brand-500">
                    {product.brand}
                  </p>
                  <p className="text-sm font-medium text-brand-900 mt-0.5 leading-snug">
                    {product.model}
                  </p>
                  <p className="text-base font-semibold text-brand-700 mt-2">
                    {fmt(price)}
                  </p>
                  {product.note && (
                    <p className="text-xs text-brand-500 mt-1">{product.note}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Card>

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
