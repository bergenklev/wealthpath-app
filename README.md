# Wealthpath — Personal Wealth Management Prototype

A working prototype of an all-in-one personal wealth management app: loan pricing, investment/savings forecasting, market tracking, goal-based savings planning, and financial news — built for individuals, not businesses.

This is a functional starting point with realistic sample data, meant to be extended into a production app.

## Features included

- **Loans** — mortgage calculator with country-specific rules (Sweden's amorteringskrav / mandatory minimum amortization based on loan-to-value and debt-to-income; standard US fixed-rate amortization), plus a private/personal loan calculator (car loans, consumer credit) with setup and monthly fees factored into an effective APR. Full amortization schedules and principal-vs-interest breakdowns.
- **Investments & savings** — project how a lump sum plus monthly contributions grow over time, with selectable expected-return presets (savings account, bonds, balanced, index fund, aggressive) or a custom rate. Toggle inflation on/off to compare nominal vs. real (purchasing-power-adjusted) outcomes. Country-aware account types (Swedish ISK/KF vs. US taxable/401(k)/Roth IRA) with a simplified ISK schablonskatt estimate.
- **Markets** — browse sample stocks, ETFs, and bonds with prices, daily change, and yield; filter by asset class and country; click any asset for a simulated price history chart; star assets into a locally-saved watchlist.
- **Goals** — pick a purchase (watch, trip, car, house down payment, emergency fund, or a custom goal), see the inflation-adjusted future price, and get the exact monthly savings amount required if invested vs. kept in cash.
- **News** — sample financial headlines with category filters (Markets, Rates, Housing, Personal Finance, Crypto) and search.
- **Settings** — global country/currency and inflation defaults, persisted in the browser.

All calculations live in `lib/finance.ts` as pure, dependency-free functions — easy to unit test and reuse from an API route later.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **Recharts** for charts
- No backend/database yet — all data is in-memory or `localStorage` (see "Next steps" below for making it real)

## Getting started

```bash
cd pwm-app
npm install
npm run dev
```

Then open http://localhost:3000.

To build for production:

```bash
npm run build
npm run start
```

## Project structure

```
pwm-app/
  app/
    page.tsx              Dashboard
    loans/page.tsx         Mortgage + private loan calculators
    investments/page.tsx   Savings/investment growth projections
    markets/page.tsx       Stocks/ETFs/bonds + watchlist
    goals/page.tsx          Save-for-a-purchase planner
    news/page.tsx           Financial news feed
    settings/page.tsx       Country/currency/inflation defaults
    layout.tsx / globals.css
  components/
    Nav.tsx, Card.tsx, GrowthChart.tsx, PriceHistoryChart.tsx
  context/
    SettingsContext.tsx    Global country/currency/inflation state
  lib/
    finance.ts             All calculation logic (loans, growth, goals, taxes)
    mockData.ts             Sample market assets + news + price-history generator
```

## Important disclaimer

Tax brackets, ISK schablonskatt, mortgage amortization rules, and market prices in this app are **simplified and illustrative**, sourced from general knowledge and rounded for clarity. Before using this for real decisions, verify current rules against official sources (Skatteverket, Finansinspektionen, IRS) and consider consulting a licensed financial advisor. This is a planning/education tool, not financial advice.

## Turning this into a real product: suggested next steps

**Make the data real**
- Swap `lib/mockData.ts` for a live market data API — good free/cheap options: Alpha Vantage, Twelve Data, Finnhub, or IEX Cloud for US/global equities; most brokers (Avanza, Nordnet) don't offer public APIs, so a scraping or manual-entry fallback may be needed for Swedish-specific instruments.
- Add a real news API (e.g. NewsAPI, or RSS feeds from Reuters/Bloomberg/Dagens Industri/Riksbanken/Federal Reserve press releases).
- Replace the mock net worth/dashboard numbers with data pulled from linked accounts.

**Add accounts, persistence, and auth**
- Add a database (Postgres via Supabase/Neon, or SQLite for a simple self-hosted version) to store user profiles, saved scenarios, goals, and watchlists instead of `localStorage`.
- Add authentication (NextAuth.js / Clerk / Auth0) so each person has a private, secured account — essential for anything holding real financial data.
- Consider end-to-end encryption or at minimum encryption-at-rest for sensitive financial figures.

**Bank/account aggregation**
- Integrate an open banking / account aggregation API (Plaid in the US, Tink or GoCardless/Nordigen in Europe/Sweden) so net worth, balances, and transactions populate automatically instead of manual entry.

## More feature ideas for an all-in-one personal wealth platform

Organized roughly by theme — useful as a backlog once the core prototype is validated.

**Planning & forecasting**
- Retirement / FIRE calculator: project when you can retire based on savings rate, expected spending, and withdrawal rate (e.g. the 4% rule), with Monte Carlo simulation to show a range of outcomes instead of a single line.
- Full cash-flow/budgeting tool: track income vs. expenses by category, recurring bills, and subscriptions, feeding directly into the savings projections instead of using manually entered contribution amounts.
- Scenario comparison: save multiple "what-if" scenarios side by side (e.g. "buy vs. rent," "extra mortgage payments vs. investing the difference," "career change with lower income").
- Debt payoff planner: avalanche vs. snowball strategies across multiple debts, with payoff timeline and interest saved.
- Life-event planning: children's education savings (e.g. 529 plans in the US, or general fund goals in Sweden), wedding, career break, sabbatical.
- Currency and multi-country planning: for people who split time or income between countries, model taxes and cost of living side by side.

**Investing & markets**
- Portfolio tracker: connect real brokerage holdings (via Plaid Investments API or manual entry) to see actual asset allocation, performance, and fees over time — not just projections.
- Diversification/risk analysis: flag concentration risk (e.g. too much in one stock or sector) and show a risk score.
- Dividend tracker: upcoming and historical dividend payments, yield-on-cost over time.
- ESG/sustainable investing filters for the markets screener.
- Crypto tracking alongside traditional assets, with the same forecasting tools applied.
- Robo-advisor-style suggested allocations based on risk tolerance and time horizon.
- Rebalancing alerts: notify when a portfolio drifts from its target allocation.

**Loans & housing**
- Refinance analyzer: compare current loan terms to new offers and calculate break-even period.
- Buy vs. rent calculator for housing decisions.
- Rental property / real estate investment analysis: cap rate, cash-on-cash return, mortgage stress testing.
- Extra payment / prepayment simulator showing interest saved and payoff acceleration for any loan.

**Tax & protection**
- More complete, jurisdiction-specific tax estimators (multiple countries, state/local taxes, deductions/credits) — ideally pulling from a maintained tax-rules API/service rather than hardcoded brackets.
- Insurance needs calculator (life, disability, home) based on dependents and debts.
- Basic estate planning: will/beneficiary checklist, simplified Swedish "arv" (inheritance) and US estate tax overviews.
- Tax-loss harvesting simulator for taxable brokerage accounts.

**Engagement & usability**
- Financial health score: a single composite number (like a credit score) combining savings rate, debt-to-income, emergency fund coverage, and diversification.
- Notifications/alerts: price targets, interest rate changes, bill due dates, goal milestones.
- Economic calendar: upcoming central bank meetings, CPI releases, earnings dates relevant to the user's holdings/country.
- Gamification: savings streaks, badges for hitting milestones, progress bars for goals.
- Household/shared finances: invite a partner to a shared view for joint goals and combined net worth.
- Export/share: generate a PDF report of net worth, projections, or a goal plan.
- Mobile app (React Native, reusing the same `lib/finance.ts` calculation engine) and dark mode.
- An AI assistant that can answer "what if" questions in plain language by calling into the same calculation engine.

## Suggested build order

1. Wire in real market data + news for the Markets/News pages (read-only, no auth needed yet).
2. Add authentication and a database; move `localStorage` state (watchlist, settings) into the database per user.
3. Add manual account/holding entry so the Dashboard reflects a real net worth instead of mock numbers.
4. Layer in bank aggregation (Plaid/Tink) to automate that entry.
5. Build out the budgeting/cash-flow feature so investment contribution amounts can be derived from real spending instead of a manual guess.
6. Expand tax and country coverage based on where your actual users are.
