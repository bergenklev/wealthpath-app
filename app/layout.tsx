import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Wealthpath — Personal Wealth Management",
  description:
    "Plan, forecast, and grow your personal finances: loans, investments, markets, goals, and news in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>
          <Nav />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
          <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-xs text-brand-400">
            Wealthpath is an educational prototype. Figures are illustrative,
            not financial, tax, or legal advice.
          </footer>
        </SettingsProvider>
      </body>
    </html>
  );
}
