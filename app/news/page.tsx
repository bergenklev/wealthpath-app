"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { NEWS_ITEMS, NewsItem } from "@/lib/mockData";

const CATEGORIES: (NewsItem["category"] | "all")[] = [
  "all",
  "Markets",
  "Rates",
  "Housing",
  "Personal Finance",
  "Crypto",
];

export default function NewsPage() {
  const [category, setCategory] = useState<NewsItem["category"] | "all">(
    "all"
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return NEWS_ITEMS.filter((n) => {
      const matchesCategory = category === "all" || n.category === category;
      const matchesQuery =
        query.trim() === "" ||
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.summary.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    }).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  }, [category, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-900">
          Financial news
        </h1>
        <p className="text-brand-500 text-sm mt-1">
          Stay on top of rates, housing, and market headlines. Sample
          headlines shown — connect a real news/market-data API to make this
          live (see README).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                category === c
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-brand-200 text-brand-700 bg-white"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search headlines..."
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((n) => (
          <Card key={n.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  {n.category}
                </span>
                <h3 className="font-semibold text-brand-900 mt-2">
                  {n.title}
                </h3>
                <p className="text-sm text-brand-600 mt-1">{n.summary}</p>
                <p className="text-xs text-brand-400 mt-2">
                  {n.source} &middot; {n.publishedAt}
                </p>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-brand-500">
            No headlines match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
