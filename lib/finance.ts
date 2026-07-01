// ---------------------------------------------------------------------------
// Core financial calculation engine.
//
// Everything here is deliberately dependency-free (pure functions) so it can
// be unit tested easily and reused from any page or API route.
//
// IMPORTANT: The tax/loan rules below are simplified, illustrative models for
// a personal finance prototype. They are NOT tax or legal advice and should
// be verified against Skatteverket (Sweden) / IRS (US) rules before relying
// on them for real decisions.
// ---------------------------------------------------------------------------

export type CountryCode = "SE" | "US";

// ---- Loans & mortgages -----------------------------------------------------

export interface AmortizationRow {
  month: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

/**
 * Standard fixed-rate loan payment (annuity formula).
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRatePct: number,
  years: number
): number {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  const payment = (principal * r) / (1 - Math.pow(1 + r, -n));
  return payment;
}

/**
 * Full month-by-month amortization schedule for a fixed-rate loan, with an
 * optional constant extra payment applied to principal each month.
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRatePct: number,
  years: number,
  extraMonthlyPayment = 0
): AmortizationRow[] {
  const r = annualRatePct / 100 / 12;
  const basePayment = calculateMonthlyPayment(principal, annualRatePct, years);
  const rows: AmortizationRow[] = [];
  let balance = principal;
  let month = 0;
  const maxMonths = years * 12 * 2; // safety cap

  while (balance > 0.01 && month < maxMonths) {
    month += 1;
    const interestPaid = balance * r;
    let principalPaid = basePayment - interestPaid + extraMonthlyPayment;
    let payment = basePayment + extraMonthlyPayment;
    if (principalPaid > balance) {
      principalPaid = balance;
      payment = principalPaid + interestPaid;
    }
    balance = Math.max(0, balance - principalPaid);
    rows.push({
      month,
      payment,
      principalPaid,
      interestPaid,
      balance,
    });
  }
  return rows;
}

export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  annualRatePct: number;
  years: number;
  country: CountryCode;
  householdIncomeAnnual?: number; // used for SE amorteringskrav
}

export interface MortgageResult {
  loanAmount: number;
  loanToValue: number; // decimal, e.g. 0.85
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  requiredAmortizationPct: number | null; // SE-specific, % of loan per year
  requiredAmortizationMonthly: number | null;
  notes: string[];
  schedule: AmortizationRow[];
}

/**
 * Mortgage calculator that layers in country-specific conventions:
 *  - Sweden: mandatory minimum amortization (amorteringskrav) based on LTV
 *    and (if provided) loan-to-income ratio, on top of the interest-only
 *    "market" payment.
 *  - US: standard fully-amortizing 30/15-year fixed loan, no mandatory
 *    minimum amortization rule (rules vary by lender/loan type in reality).
 */
export function calculateMortgage(input: MortgageInput): MortgageResult {
  const { homePrice, downPayment, annualRatePct, years, country } = input;
  const loanAmount = Math.max(0, homePrice - downPayment);
  const loanToValue = homePrice > 0 ? loanAmount / homePrice : 0;
  const notes: string[] = [];

  let requiredAmortizationPct: number | null = null;

  if (country === "SE") {
    // Simplified Swedish amorteringskrav (Finansinspektionen rules):
    // LTV > 70%: amortize at least 2%/year
    // LTV 50-70%: amortize at least 1%/year
    // LTV < 50%: no legal minimum
    if (loanToValue > 0.7) requiredAmortizationPct = 0.02;
    else if (loanToValue > 0.5) requiredAmortizationPct = 0.01;
    else requiredAmortizationPct = 0;

    // Extra 1% if loan > 4.5x gross household income (debt-to-income rule)
    if (
      input.householdIncomeAnnual &&
      loanAmount > input.householdIncomeAnnual * 4.5
    ) {
      requiredAmortizationPct += 0.01;
      notes.push(
        "Extra 1%/year amortization applies: loan exceeds 4.5x gross household income."
      );
    }
    notes.push(
      `Minimum legal amortization in Sweden at this loan-to-value: ${(
        requiredAmortizationPct * 100
      ).toFixed(1)}% of the original loan per year.`
    );
  } else {
    notes.push(
      "US mortgages fully amortize over the loan term by default (no separate mandatory minimum amortization rule modeled here)."
    );
  }

  const schedule = generateAmortizationSchedule(
    loanAmount,
    annualRatePct,
    years
  );
  const monthlyPaymentFromSchedule = schedule.length
    ? schedule[0].payment
    : 0;
  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = schedule.reduce((sum, row) => sum + row.interestPaid, 0);

  const requiredAmortizationMonthly =
    requiredAmortizationPct !== null
      ? (loanAmount * requiredAmortizationPct) / 12
      : null;

  if (
    country === "SE" &&
    requiredAmortizationMonthly !== null &&
    requiredAmortizationMonthly > monthlyPaymentFromSchedule * 0.999
  ) {
    // when the standard amortizing payment already exceeds the legal
    // minimum (common for 15-30yr terms at normal rates) note that it's covered
    notes.push(
      "Your chosen loan term already amortizes faster than the legal minimum."
    );
  }

  return {
    loanAmount,
    loanToValue,
    monthlyPayment: monthlyPaymentFromSchedule,
    totalInterest,
    totalPaid,
    requiredAmortizationPct,
    requiredAmortizationMonthly,
    notes,
    schedule,
  };
}

export interface PrivateLoanInput {
  loanAmount: number;
  annualRatePct: number;
  years: number;
  setupFee?: number;
  monthlyFee?: number;
}

export interface PrivateLoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalFees: number;
  totalCost: number;
  effectiveAnnualRatePct: number; // approximate APR including fees
  schedule: AmortizationRow[];
}

/**
 * Unsecured personal loan / car loan / consumer credit calculator.
 * Includes optional setup and monthly fees to approximate a real APR.
 */
export function calculatePrivateLoan(input: PrivateLoanInput): PrivateLoanResult {
  const { loanAmount, annualRatePct, years, setupFee = 0, monthlyFee = 0 } =
    input;
  const schedule = generateAmortizationSchedule(loanAmount, annualRatePct, years);
  const monthlyPayment = schedule.length ? schedule[0].payment : 0;
  const totalInterest = schedule.reduce((sum, r) => sum + r.interestPaid, 0);
  const totalFees = setupFee + monthlyFee * schedule.length;
  const totalCost = totalInterest + totalFees;

  // Rough effective APR: treat total fees as extra "interest" spread over
  // the term to approximate the true cost of borrowing.
  const nominalTotalPaid = schedule.reduce((s, r) => s + r.payment, 0);
  const effectiveAnnualRatePct =
    loanAmount > 0
      ? (((nominalTotalPaid + totalFees - loanAmount) / loanAmount) /
          years) *
        100
      : 0;

  return {
    monthlyPayment,
    totalInterest,
    totalFees,
    totalCost,
    effectiveAnnualRatePct,
    schedule,
  };
}

// ---- Investment / savings projections --------------------------------------

export interface GrowthYearRow {
  year: number;
  contributed: number; // cumulative principal + contributions
  nominalValue: number;
  realValue: number; // inflation-adjusted (today's purchasing power)
}

export interface ProjectionInput {
  initialAmount: number;
  monthlyContribution: number;
  annualReturnPct: number;
  years: number;
  inflationEnabled: boolean;
  inflationRatePct: number;
  contributionGrowthPct?: number; // optional annual raise to the contribution
}

export interface ProjectionResult {
  rows: GrowthYearRow[];
  finalNominalValue: number;
  finalRealValue: number;
  totalContributed: number;
  totalGrowth: number;
}

/**
 * Projects investment/savings growth with monthly compounding and monthly
 * contributions, optionally adjusting for inflation to show real
 * (purchasing-power) value alongside nominal value.
 */
export function projectGrowth(input: ProjectionInput): ProjectionResult {
  const {
    initialAmount,
    monthlyContribution,
    annualReturnPct,
    years,
    inflationEnabled,
    inflationRatePct,
    contributionGrowthPct = 0,
  } = input;

  const monthlyRate = annualReturnPct / 100 / 12;
  const monthlyInflation = inflationRatePct / 100 / 12;

  let balance = initialAmount;
  let contributed = initialAmount;
  let currentMonthlyContribution = monthlyContribution;
  const rows: GrowthYearRow[] = [];

  rows.push({
    year: 0,
    contributed,
    nominalValue: balance,
    realValue: balance,
  });

  for (let month = 1; month <= years * 12; month++) {
    balance = balance * (1 + monthlyRate) + currentMonthlyContribution;
    contributed += currentMonthlyContribution;

    if (month % 12 === 0) {
      const yearIndex = month / 12;
      const inflationFactor = inflationEnabled
        ? Math.pow(1 + monthlyInflation, month)
        : 1;
      rows.push({
        year: yearIndex,
        contributed,
        nominalValue: balance,
        realValue: balance / inflationFactor,
      });
      if (contributionGrowthPct) {
        currentMonthlyContribution *= 1 + contributionGrowthPct / 100;
      }
    }
  }

  const last = rows[rows.length - 1];
  return {
    rows,
    finalNominalValue: last.nominalValue,
    finalRealValue: last.realValue,
    totalContributed: last.contributed,
    totalGrowth: last.nominalValue - last.contributed,
  };
}

/**
 * Adjusts a future price for inflation, e.g. "a trip that costs 20,000 today
 * will cost X in 5 years at 2% inflation."
 */
export function inflateFutureValue(
  presentValue: number,
  years: number,
  inflationRatePct: number
): number {
  return presentValue * Math.pow(1 + inflationRatePct / 100, years);
}

// ---- Goal-based savings ------------------------------------------------------

export interface GoalInput {
  targetAmountToday: number;
  years: number; // time until purchase
  annualReturnPct: number; // expected return while saving toward the goal
  currentSavings?: number;
  inflationEnabled: boolean;
  inflationRatePct: number;
}

export interface GoalResult {
  inflatedTargetAmount: number;
  requiredMonthlySavings: number;
  monthsToGoal: number;
  totalContributions: number;
  totalGrowth: number;
}

/**
 * Given a product/experience that costs X today, computes the inflation
 * adjusted future price and the flat monthly savings amount required to
 * reach it by investing at the given expected return.
 */
export function calculateGoalSavings(input: GoalInput): GoalResult {
  const {
    targetAmountToday,
    years,
    annualReturnPct,
    currentSavings = 0,
    inflationEnabled,
    inflationRatePct,
  } = input;

  const inflatedTargetAmount = inflationEnabled
    ? inflateFutureValue(targetAmountToday, years, inflationRatePct)
    : targetAmountToday;

  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualReturnPct / 100 / 12;

  // Future value of current savings compounding on its own:
  const fvCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, months);
  const remainingTarget = Math.max(0, inflatedTargetAmount - fvCurrentSavings);

  // Solve for monthly payment (ordinary annuity) that reaches remainingTarget:
  let requiredMonthlySavings: number;
  if (monthlyRate === 0) {
    requiredMonthlySavings = remainingTarget / months;
  } else {
    requiredMonthlySavings =
      (remainingTarget * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalContributions = requiredMonthlySavings * months + currentSavings;
  const totalGrowth = inflatedTargetAmount - totalContributions;

  return {
    inflatedTargetAmount,
    requiredMonthlySavings: Math.max(0, requiredMonthlySavings),
    monthsToGoal: months,
    totalContributions,
    totalGrowth: Math.max(0, totalGrowth),
  };
}

// ---- Simplified tax models ---------------------------------------------------

export interface TaxBracket {
  upTo: number | null; // null = no upper bound
  ratePct: number;
}

// Illustrative only, approximate 2025/2026-ish figures rounded for clarity.
export const SE_MUNICIPAL_TAX_RATE_PCT = 32; // approx average kommunalskatt
export const SE_STATE_TAX_BRACKETS: TaxBracket[] = [
  { upTo: 615_300, ratePct: 0 }, // below the state tax threshold (approx, SEK/year)
  { upTo: null, ratePct: 20 },
];
export const SE_ISK_GOVT_BORROWING_RATE_PCT = 2.62; // illustrative statslaneranta
export const SE_ISK_MIN_TAX_BASE_RATE_PCT = 1.25; // schablonskatt floor

export const US_FEDERAL_BRACKETS_SINGLE: TaxBracket[] = [
  { upTo: 11_600, ratePct: 10 },
  { upTo: 47_150, ratePct: 12 },
  { upTo: 100_525, ratePct: 22 },
  { upTo: 191_950, ratePct: 24 },
  { upTo: 243_725, ratePct: 32 },
  { upTo: 609_350, ratePct: 35 },
  { upTo: null, ratePct: 37 },
];
export const US_LONG_TERM_CAPITAL_GAINS_BRACKETS: TaxBracket[] = [
  { upTo: 47_025, ratePct: 0 },
  { upTo: 518_900, ratePct: 15 },
  { upTo: null, ratePct: 20 },
];

function applyProgressiveBrackets(income: number, brackets: TaxBracket[]): number {
  let tax = 0;
  let lastCap = 0;
  for (const bracket of brackets) {
    const cap = bracket.upTo ?? Infinity;
    const taxableInThisBracket = Math.max(0, Math.min(income, cap) - lastCap);
    tax += taxableInThisBracket * (bracket.ratePct / 100);
    lastCap = cap;
    if (income <= cap) break;
  }
  return tax;
}

/**
 * Simplified Swedish income tax estimate: flat municipal tax + progressive
 * state tax above the threshold. Ignores jobbskatteavdrag and other credits.
 */
export function estimateSwedishIncomeTax(annualGrossIncomeSEK: number): number {
  const municipal = annualGrossIncomeSEK * (SE_MUNICIPAL_TAX_RATE_PCT / 100);
  const state = applyProgressiveBrackets(
    annualGrossIncomeSEK,
    SE_STATE_TAX_BRACKETS
  );
  return municipal + state;
}

/**
 * Simplified Swedish ISK/KF flat "schablonskatt" for a given account balance.
 * Real rule: tax base = average quarterly balance x (govt borrowing rate + 1%),
 * with a floor of 1.25%. Tax itself is charged at 30% of that base.
 */
export function estimateISKTax(averageAccountBalanceSEK: number): number {
  const baseRatePct = Math.max(
    SE_ISK_GOVT_BORROWING_RATE_PCT + 1,
    SE_ISK_MIN_TAX_BASE_RATE_PCT
  );
  const taxableBase = averageAccountBalanceSEK * (baseRatePct / 100);
  return taxableBase * 0.3;
}

/**
 * Simplified US federal income tax estimate (single filer, standard
 * deduction only, no state tax, no credits).
 */
export function estimateUSFederalIncomeTax(
  annualGrossIncomeUSD: number,
  standardDeductionUSD = 14_600
): number {
  const taxable = Math.max(0, annualGrossIncomeUSD - standardDeductionUSD);
  return applyProgressiveBrackets(taxable, US_FEDERAL_BRACKETS_SINGLE);
}

/**
 * Simplified US long-term capital gains tax estimate (single filer).
 */
export function estimateUSCapitalGainsTax(
  totalTaxableIncomeUSD: number,
  longTermGainUSD: number
): number {
  // Gains "stack" on top of ordinary income for bracket purposes (simplified).
  const upperBound = totalTaxableIncomeUSD + longTermGainUSD;
  const taxAtUpper = applyProgressiveBrackets(
    upperBound,
    US_LONG_TERM_CAPITAL_GAINS_BRACKETS
  );
  const taxAtLower = applyProgressiveBrackets(
    totalTaxableIncomeUSD,
    US_LONG_TERM_CAPITAL_GAINS_BRACKETS
  );
  return Math.max(0, taxAtUpper - taxAtLower);
}

// ---- Formatting helpers -------------------------------------------------------

export function formatCurrency(
  value: number,
  currency: string,
  locale = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toFixed(0)} ${currency}`;
  }
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
