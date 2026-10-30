import { ChangeFilter } from "../api";

type Props = {
  value: string;
  onChange: (value: ChangeFilter) => void;
  wishlist?: boolean;
};

export function ChangeFilters({ value, onChange, wishlist }: Props) {
  const options: [ChangeFilter, string][] = [
    ...(wishlist ? [["", "All saved"] as [ChangeFilter, string]] : []),
    ["all", wishlist ? "Recent updates" : "All updates"],
    ["new", "New arrivals"],
    ["price_drop", "Price drops"],
    ["restock", "Back in stock"],
    ...(wishlist ? [["removed", "No longer listed"] as [ChangeFilter, string]] : []),
  ];
  return (
    <div className="change-filters" role="group" aria-label="Product updates">
      {options.map(([key, label]) => (
        <button key={key} type="button" aria-pressed={value === key} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  );
}
