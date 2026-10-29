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

type ChipProps = { label: string; checked: boolean; onChange: (checked: boolean) => void };

/** A checkbox drawn as a chip. The real checkbox stays for keyboard and screen readers. */
function ToggleChip({ label, checked, onChange }: ChipProps) {
  return (
    <label className={`chip ${checked ? "is-on" : ""}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <svg className="chip-icon" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2.5 6.2 5 8.6l4.5-5" />
      </svg>
      {label}
    </label>
  );
}

/** All filters live in the URL (?size=M&on_sale=true…), so a filtered view can be bookmarked. */
export function Filters({ options, params, onChange }: Props) {
  return (
    <section className="filters" aria-label="Filters">
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

        <ToggleChip
          label="In stock only"
          checked={params.get("in_stock") !== "false"}
          onChange={(on) => onChange({ in_stock: on ? null : "false" })}
        />
        <ToggleChip
          label="On sale"
          checked={params.get("on_sale") === "true"}
          onChange={(on) => onChange({ on_sale: on ? "true" : null })}
        />
      </div>
    </section>
  );
}
