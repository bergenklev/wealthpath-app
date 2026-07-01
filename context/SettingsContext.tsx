"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CountryCode = "SE" | "US";

export interface CountryProfile {
  code: CountryCode;
  label: string;
  currency: string;
  currencySymbol: string;
  defaultInflation: number; // as a decimal, e.g. 0.02 = 2%
  taxAccountNote: string;
}

export const COUNTRY_PROFILES: Record<CountryCode, CountryProfile> = {
  SE: {
    code: "SE",
    label: "Sweden",
    currency: "SEK",
    currencySymbol: "kr",
    defaultInflation: 0.02,
    taxAccountNote:
      "ISK/KF accounts use a flat annual schablonskatt instead of capital gains tax.",
  },
  US: {
    code: "US",
    label: "United States",
    currency: "USD",
    currencySymbol: "$",
    defaultInflation: 0.025,
    taxAccountNote:
      "Taxable brokerage accounts pay capital gains tax; 401(k)/IRA growth is tax-deferred or tax-free.",
  },
};

interface SettingsContextValue {
  country: CountryCode;
  setCountry: (c: CountryCode) => void;
  profile: CountryProfile;
  inflationEnabled: boolean;
  setInflationEnabled: (v: boolean) => void;
  inflationRate: number; // decimal
  setInflationRate: (v: number) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "pwm-settings-v1";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>("SE");
  const [inflationEnabled, setInflationEnabledState] = useState(true);
  const [inflationRate, setInflationRateState] = useState(0.02);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.country) setCountryState(parsed.country);
        if (typeof parsed.inflationEnabled === "boolean")
          setInflationEnabledState(parsed.inflationEnabled);
        if (typeof parsed.inflationRate === "number")
          setInflationRateState(parsed.inflationRate);
      } else {
        setInflationRateState(COUNTRY_PROFILES.SE.defaultInflation);
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ country, inflationEnabled, inflationRate })
    );
  }, [country, inflationEnabled, inflationRate, hydrated]);

  const setCountry = (c: CountryCode) => {
    setCountryState(c);
    setInflationRateState(COUNTRY_PROFILES[c].defaultInflation);
  };

  const value: SettingsContextValue = {
    country,
    setCountry,
    profile: COUNTRY_PROFILES[country],
    inflationEnabled,
    setInflationEnabled: setInflationEnabledState,
    inflationRate,
    setInflationRate: setInflationRateState,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
