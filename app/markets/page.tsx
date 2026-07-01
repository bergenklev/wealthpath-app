"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import {
  AssetClass,
  MARKET_ASSETS,
  generateHistory,
  MarketAsset,
} from "@/lib/mockData";
import { formatCurrency, formatPercent } from "@/lib/finance";

const WATCHLIST_KEY = "pwm-watchlist-v1";
const CLASS_LABELS: Record<AssetClass | "all", string> = {
  all: "All",
  stock: "Stocks",
  etf: "ETFs & funds",
  bond: "Bonds",
};

export default function MarketsPage() {
  const [classFilter, setClassFilter] = useState<AssetClass | "all">("all");
  const [countryFilter, setCountryFilter] = useState<
    "all" | "SE" | "US" | "Global"
  >("all");
  const [selected, setSelected] = useState<MarketAsset>(MARKET_ASSETS[0]);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WATCHLIST_KEY);
      if (raw) setWatchlist(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatch = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const filtered = useMemo(
    () =>
      MARKET_ASSETS.filter(
        (a) =>
          (classFilter === "all" || a.assetClass === classFilter) &&
          (countryFilter === "all" || a.country === countryFilter)
      ),
    [classFilter, countryFilter]
  );

  const history = useMemo(
    () => generateHistory(selected.symbol, selected.price),
    [selected]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">Markets</h1>
        <p className="text-brand-500 text-sm mt-1">
          Follow stocks, ETFs, and bonds. Prices shown are simulated sample
          data — see the README for how to wire up a live market data API.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "stock", "etf", "bond"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setClassFilter(c)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              classFilter === c
                ? "bg-brand-600 text-white border-brand-600"
                : "border-brand-200 text-brand-700 bg-white"
            }`}
          >
            {CLASS_LABELS[c]}
          </button>
        ))}
        <span className="w-px bg-brand-100 mx-1" />
        {(["all", "SE", "US", "Global"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCountryFilter(c)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              countryFilter === c
                ? "bg-brand-800 text-white border-brand-800"
                : "border-brand-200 text-brand-700 bg-white"
            }`}
          >
            {c === "all" ? "All markets" : c}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Assets" className="lg:col-span-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brand-500 text-xs uppercase">
                <th className="py-2 pr-2"></th>
                <th className="py-2 pr-2">Symbol</th>
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Price</th>
                <th className="py-2 pr-2">Change</th>
                <th className="py-2 pr-2">Yield</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.symbol}
                  onClick={() => setSelected(a)}
                  className={`cursor-pointer border-t border-brand-50 hover:bg-brand-50 ${
                    selected.symbol === a.symbol ? "bg-brand-50" : ""
                  }`}
                >
                  <td className="py-2 pr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatch(a.symbol);
                      }}
                      className={
                        watchlist.includes(a.symbol)
                          ? "text-amber-500"
                          : "text-brand-200"
                      }
                      title="Toggle watchlist"
                    >
                      ★
                    </button>
                  </td>
                  <td className="py-2 pr-2 font-medium">{a.symbol}</td>
                  <td className="py-2 pr-2 text-brand-700">{a.name}</td>
                  <td className="py-2 pr-2">
                    {formatCurrency(a.price, a.currency)}
                  </td>
                  <td
                    className={`py-2 pr-2 ${
                      a.changePct >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {a.changePct >= 0 ? "+" : ""}
                    {formatPercent(a.changePct)}
                  </td>
                  <td className="py-2 pr-2 text-brand-700">
                    {a.yieldPct !== undefined ? formatPercent(a.yieldPct) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-4">
          <Card title={`${selected.symbol} · ${selected.name}`}>
            <p className="text-sm text-brand-600 mb-3">{selected.description}</p>
            <PriceHistoryChart data={history} />
            <p className="text-xs text-brand-500 mt-2">
              90-day simulated price history.
            </p>
          </Card>
          <Card title="Watchlist" subtitle="Stored locally in your browser">
            {watchlist.length === 0 ? (
              <p className="text-sm text-brand-500">
                Star an asset to add it here.
              </p>
            ) : (
              <ul className="text-sm space-y-2">
                {watchlist.map((symbol) => {
                  const asset = MARKET_ASSETS.find((a) => a.symbol === symbol);
                  if (!asset) return null;
                  return (
                    <li
                      key={symbol}
                      className="flex justify-between items-center"
                    >
                      <span>{asset.symbol}</span>
                      <span>{formatCurrency(asset.price, asset.currency)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
