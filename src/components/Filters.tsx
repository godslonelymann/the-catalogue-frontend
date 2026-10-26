import { FormEvent, useState } from "react";

import { FilterOptions } from "../api";

type Props = {
  options: FilterOptions | null;
  params: URLSearchParams;
  onChange: (changes: Record<string, string | null>) => void;
};

const SORTS = [
  ["newest", "Newest"],
  ["price_asc", "Price: low to high"],
  ["price_desc", "Price: high to low"],
  ["discount", "Biggest discount"],
  ["title", "Name"],
] as const;

/** All filters live in the URL (?size=M&on_sale=true…), so a filtered view can be bookmarked. */
export function Filters({ options, params, onChange }: Props) {
  const [q, setQ] = useState(params.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("max_price") ?? "");

  function submit(e: FormEvent) {
    e.preventDefault();
    onChange({ q: q.trim() || null, min_price: minPrice || null, max_price: maxPrice || null });
  }

  return (
    <section className="filters" aria-label="Filters">
      <form className="filters-search" onSubmit={submit}>
        <input
          type="search"
          placeholder="Search title or tags"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />
        <input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder={options?.min_price ? `Min ₹${Math.floor(Number(options.min_price))}` : "Min ₹"}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          aria-label="Minimum price"
        />
        <input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder={options?.max_price ? `Max ₹${Math.ceil(Number(options.max_price))}` : "Max ₹"}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          aria-label="Maximum price"
        />
        <button type="submit" className="button">
          Apply
        </button>
      </form>

      <div className="filters-row">
        <select value={params.get("size") ?? ""} onChange={(e) => onChange({ size: e.target.value || null })} aria-label="Size">
          <option value="">Any size</option>
          {options?.sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={params.get("category") ?? ""}
          onChange={(e) => onChange({ category: e.target.value || null })}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {options?.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select value={params.get("sort") ?? "newest"} onChange={(e) => onChange({ sort: e.target.value })} aria-label="Sort">
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label className="check">
          <input
            type="checkbox"
            checked={params.get("in_stock") !== "false"}
            onChange={(e) => onChange({ in_stock: e.target.checked ? null : "false" })}
          />
          In stock only
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={params.get("on_sale") === "true"}
            onChange={(e) => onChange({ on_sale: e.target.checked ? "true" : null })}
          />
          On sale
        </label>
      </div>
    </section>
  );
}
