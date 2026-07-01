import { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-brand-100 shadow-sm p-5 ${className}`}
    >
      {title && (
        <div className="mb-3">
          <h3 className="font-semibold text-brand-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-brand-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  positive,
}: {
  label: string;
  value: string;
  hint?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-4">
      <p className="text-xs uppercase tracking-wide text-brand-500">{label}</p>
      <p className="text-2xl font-semibold text-brand-900 mt-1">{value}</p>
      {hint && (
        <p
          className={`text-xs mt-1 ${
            positive === undefined
              ? "text-brand-500"
              : positive
              ? "text-emerald-600"
              : "text-red-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-brand-800 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent";
