"use client";

import { formatCurrency } from "@/lib/finance";

export interface LineItem {
  id: string;
  label: string;
  value: number;
}

export default function EditableLineItems({
  items,
  currency,
  onChange,
  addLabel = "+ Add item",
}: {
  items: LineItem[];
  currency: string;
  onChange: (items: LineItem[]) => void;
  addLabel?: string;
}) {
  const update = (id: string, patch: Partial<LineItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const remove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const add = () => {
    onChange([
      ...items,
      { id: `item-${Date.now()}`, label: "New item", value: 0 },
    ]);
  };

  const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  return (
    <div>
      {items.length === 0 && (
        <p className="text-sm text-brand-500 py-2">
          Nothing here yet — add your first item below.
        </p>
      )}
      <ul className="divide-y divide-brand-50">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 py-2">
            <input
              type="text"
              value={item.label}
              onChange={(e) => update(item.id, { label: e.target.value })}
              className="flex-1 min-w-0 rounded-md border border-transparent hover:border-brand-200 focus:border-brand-400 px-2 py-1.5 text-sm focus:outline-none bg-transparent"
              placeholder="Label"
            />
            <input
              type="number"
              value={item.value}
              onChange={(e) => update(item.id, { value: Number(e.target.value) })}
              className="w-32 rounded-md border border-brand-200 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              onClick={() => remove(item.id)}
              className="text-brand-300 hover:text-red-500 px-1 text-lg leading-none"
              aria-label="Remove item"
              type="button"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-100">
        <button
          onClick={add}
          type="button"
          className="text-sm text-brand-600 font-medium hover:underline"
        >
          {addLabel}
        </button>
        <span className="text-sm font-semibold text-brand-900">
          Total: {formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  );
}
