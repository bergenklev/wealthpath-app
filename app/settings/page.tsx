"use client";

import { COUNTRY_PROFILES, CountryCode, useSettings } from "@/context/SettingsContext";
import { Card, Field, inputClass } from "@/components/Card";

export default function SettingsPage() {
  const {
    country,
    setCountry,
    profile,
    inflationEnabled,
    setInflationEnabled,
    inflationRate,
    setInflationRate,
  } = useSettings();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">Settings</h1>
        <p className="text-brand-500 text-sm mt-1">
          These defaults apply across the app; individual calculators let you
          override inflation for a specific scenario.
        </p>
      </div>

      <Card title="Country & currency">
        <Field label="Country">
          <select
            className={inputClass}
            value={country}
            onChange={(e) => setCountry(e.target.value as CountryCode)}
          >
            {Object.values(COUNTRY_PROFILES).map((p) => (
              <option key={p.code} value={p.code}>
                {p.label} ({p.currency})
              </option>
            ))}
          </select>
        </Field>
        <p className="text-sm text-brand-500">
          Currency: <strong>{profile.currency}</strong> &middot; Tax-advantaged
          accounts: {profile.taxAccountNote}
        </p>
      </Card>

      <Card title="Inflation">
        <label className="flex items-center gap-2 text-sm font-medium text-brand-800 mb-3">
          <input
            type="checkbox"
            checked={inflationEnabled}
            onChange={(e) => setInflationEnabled(e.target.checked)}
          />
          Adjust forecasts for inflation by default
        </label>
        <Field label="Default inflation rate (% / year)">
          <input
            type="number"
            step="0.1"
            className={inputClass}
            value={(inflationRate * 100).toFixed(1)}
            onChange={(e) => setInflationRate(Number(e.target.value) / 100)}
          />
        </Field>
      </Card>

      <Card title="About this prototype">
        <p className="text-sm text-brand-600">
          Wealthpath is a personal wealth management prototype covering loans,
          investment projections, market tracking, goal-based savings, and
          news — all in one place. Market data and account balances shown
          throughout the app are simulated sample data, and tax figures are
          simplified estimates, not advice. See the project README for the
          roadmap of features to add next and instructions for connecting
          real data sources.
        </p>
      </Card>
    </div>
  );
}
