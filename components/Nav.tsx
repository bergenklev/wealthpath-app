"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/loans", label: "Loans" },
  { href: "/investments", label: "Investments" },
  { href: "/markets", label: "Markets" },
  { href: "/goals", label: "Goals" },
  { href: "/news", label: "News" },
  { href: "/settings", label: "Settings" },
];

export default function Nav() {
  const pathname = usePathname();
  const { profile } = useSettings();

  return (
    <header className="border-b border-brand-100 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
            W
          </div>
          <span className="font-semibold text-brand-900">Wealthpath</span>
          <span className="hidden sm:inline text-xs text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">
            {profile.label} &middot; {profile.currency}
          </span>
        </div>
        <nav className="flex flex-wrap gap-1 text-sm">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-brand-800 hover:bg-brand-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
