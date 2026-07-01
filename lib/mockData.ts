// ---------------------------------------------------------------------------
// Mock market + news data.
//
// In a production version, replace the static arrays and `generateHistory`
// below with real API calls (see README for suggested providers: Alpha
// Vantage, Twelve Data, Finnhub, or a broker's own API). Every consumer in
// the app reads through the functions at the bottom of this file, so swapping
// the data source only requires editing this one module.
// ---------------------------------------------------------------------------

export type AssetClass = "stock" | "etf" | "bond";

export interface MarketAsset {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  country: "SE" | "US" | "Global";
  price: number;
  currency: string;
  changePct: number; // today's change, %
  sector?: string;
  yieldPct?: number; // for bonds / dividend yield for stocks & ETFs
  description: string;
}

export const MARKET_ASSETS: MarketAsset[] = [
  {
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    assetClass: "etf",
    country: "US",
    price: 512.34,
    currency: "USD",
    changePct: 0.42,
    sector: "Broad Market",
    yieldPct: 1.3,
    description: "Tracks the S&P 500 index of large-cap US companies.",
  },
  {
    symbol: "VWRL",
    name: "Vanguard FTSE All-World UCITS ETF",
    assetClass: "etf",
    country: "Global",
    price: 118.9,
    currency: "USD",
    changePct: -0.15,
    sector: "Global Equity",
    yieldPct: 1.8,
    description: "Broad global equity exposure across developed and emerging markets.",
  },
  {
    symbol: "AVANZA-GLOBAL",
    name: "Avanza Global (index fund)",
    assetClass: "etf",
    country: "SE",
    price: 245.1,
    currency: "SEK",
    changePct: 0.28,
    sector: "Global Equity",
    yieldPct: 0,
    description: "Popular low-fee global index fund among Swedish ISK savers.",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetClass: "stock",
    country: "US",
    price: 231.5,
    currency: "USD",
    changePct: 1.12,
    sector: "Technology",
    yieldPct: 0.5,
    description: "Consumer electronics, software, and services.",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    assetClass: "stock",
    country: "US",
    price: 452.8,
    currency: "USD",
    changePct: 0.63,
    sector: "Technology",
    yieldPct: 0.7,
    description: "Enterprise software, cloud computing, and devices.",
  },
  {
    symbol: "VOLV-B",
    name: "Volvo B",
    assetClass: "stock",
    country: "SE",
    price: 289.4,
    currency: "SEK",
    changePct: -0.35,
    sector: "Industrials",
    yieldPct: 5.1,
    description: "Swedish manufacturer of trucks, buses, and construction equipment.",
  },
  {
    symbol: "ERIC-B",
    name: "Ericsson B",
    assetClass: "stock",
    country: "SE",
    price: 74.2,
    currency: "SEK",
    changePct: 2.05,
    sector: "Telecom Equipment",
    yieldPct: 3.4,
    description: "Telecommunications equipment and network infrastructure.",
  },
  {
    symbol: "US10Y",
    name: "US 10-Year Treasury Note",
    assetClass: "bond",
    country: "US",
    price: 98.6,
    currency: "USD",
    changePct: 0.02,
    yieldPct: 4.35,
    description: "Benchmark long-term US government bond.",
  },
  {
    symbol: "SE10Y",
    name: "Swedish 10-Year Government Bond",
    assetClass: "bond",
    country: "SE",
    price: 99.1,
    currency: "SEK",
    changePct: -0.01,
    yieldPct: 2.28,
    description: "Benchmark long-term Swedish government bond.",
  },
  {
    symbol: "LQD",
    name: "iShares Investment Grade Corporate Bond ETF",
    assetClass: "bond",
    country: "US",
    price: 109.7,
    currency: "USD",
    changePct: 0.08,
    yieldPct: 5.1,
    description: "Diversified basket of US investment-grade corporate bonds.",
  },
  {
    symbol: "SPOT",
    name: "Spotify Technology",
    assetClass: "stock",
    country: "SE",
    price: 512.0,
    currency: "USD",
    changePct: 1.87,
    sector: "Media & Streaming",
    yieldPct: 0,
    description: "Global audio streaming platform, headquartered in Stockholm.",
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust (Nasdaq-100)",
    assetClass: "etf",
    country: "US",
    price: 486.2,
    currency: "USD",
    changePct: 0.91,
    sector: "Technology",
    yieldPct: 0.6,
    description: "Tracks the 100 largest non-financial companies on the Nasdaq.",
  },
];

/**
 * Deterministic pseudo-random walk so charts look realistic but are
 * reproducible between renders (no external API call needed).
 */
export function generateHistory(
  symbol: string,
  currentPrice: number,
  points = 90
): { date: string; price: number }[] {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i) * (i + 1);

  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const prices: number[] = new Array(points);
  prices[points - 1] = currentPrice;
  for (let i = points - 2; i >= 0; i--) {
    const drift = (rand() - 0.5) * 0.02; // +/-1% daily-ish noise
    prices[i] = prices[i + 1] / (1 + drift);
  }

  const today = new Date();
  return prices.map((price, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (points - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      price: Math.round(price * 100) / 100,
    };
  });
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: "Markets" | "Rates" | "Housing" | "Personal Finance" | "Crypto";
  publishedAt: string; // ISO date
  url: string;
}

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: "n1",
    title: "Riksbanken holds policy rate steady, signals cautious outlook",
    summary:
      "Sweden's central bank kept the policy rate unchanged this month, citing inflation nearing target while flagging risks from global trade tensions.",
    source: "Riksbanken (mock)",
    category: "Rates",
    publishedAt: "2026-06-28",
    url: "#",
  },
  {
    id: "n2",
    title: "Federal Reserve keeps rates on hold, eyes labor market data",
    summary:
      "The Fed left its benchmark rate unchanged, with officials noting they need more evidence inflation is durably converging to 2% before cutting further.",
    source: "Federal Reserve (mock)",
    category: "Rates",
    publishedAt: "2026-06-25",
    url: "#",
  },
  {
    id: "n3",
    title: "Swedish housing prices tick up for third straight month",
    summary:
      "Bostadspriser rose modestly across major metro areas as mortgage rates stabilized, according to the latest HOX index reading.",
    source: "Valueguard (mock)",
    category: "Housing",
    publishedAt: "2026-06-27",
    url: "#",
  },
  {
    id: "n4",
    title: "US existing home sales beat expectations in May",
    summary:
      "Existing home sales rose 2.1% month-over-month as inventory improved slightly, though affordability remains a challenge for first-time buyers.",
    source: "NAR (mock)",
    category: "Housing",
    publishedAt: "2026-06-24",
    url: "#",
  },
  {
    id: "n5",
    title: "Global equities edge higher on cooling inflation data",
    summary:
      "Major indices in the US and Europe advanced as fresh CPI prints came in below expectations, boosting hopes for further rate cuts later this year.",
    source: "Market Wire (mock)",
    category: "Markets",
    publishedAt: "2026-06-29",
    url: "#",
  },
  {
    id: "n6",
    title: "Five habits of people who reach financial independence early",
    summary:
      "A look at savings rates, automation, and investment discipline common among people who hit their FIRE number ahead of schedule.",
    source: "Personal Finance Weekly (mock)",
    category: "Personal Finance",
    publishedAt: "2026-06-20",
    url: "#",
  },
  {
    id: "n7",
    title: "Bitcoin volatility rises as options expiry approaches",
    summary:
      "Crypto markets saw increased swings ahead of a large monthly options expiry, with analysts split on near-term direction.",
    source: "Crypto Desk (mock)",
    category: "Crypto",
    publishedAt: "2026-06-26",
    url: "#",
  },
  {
    id: "n8",
    title: "ISK accounts remain the default choice for Swedish retail investors",
    summary:
      "New data shows the majority of new brokerage accounts opened in Sweden this year were investment savings accounts (ISK) rather than standard depots.",
    source: "Finansinspektionen (mock)",
    category: "Personal Finance",
    publishedAt: "2026-06-22",
    url: "#",
  },
];

export function getAssetBySymbol(symbol: string): MarketAsset | undefined {
  return MARKET_ASSETS.find((a) => a.symbol === symbol);
}
