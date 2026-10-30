import { ProductChange } from "../api";
import { useState } from "react";
import { formatObservedAt, formatPrice } from "../format";

const LABELS: Record<ProductChange["event_type"], string> = {
  new: "New", price_drop: "↓ Price dropped", restock: "Back in stock",
  removed: "No longer listed", relisted: "Listed again",
  price_increase: "Price increased", sold_out: "Sold out",
};

export function ChangeBadges({ changes }: { changes: ProductChange[] }) {
  return <>{changes.slice(0, 2).map((c) => (
    <span key={c.id} className={`update-badge update-${c.event_type}`}>{LABELS[c.event_type]}</span>
  ))}</>;
}

export function ChangeSummary({ changes }: { changes: ProductChange[] }) {
  const useful = changes.filter((c) => c.event_type === "price_drop" || c.event_type === "restock");
  return <>{useful.slice(0, 2).map((c) => (
    <p className={`change-summary change-${c.event_type}`} key={c.id}>
      {c.event_type === "price_drop"
        ? `${c.variant_label ?? "Price"}: ${formatPrice(c.old_price)} → ${formatPrice(c.new_price)}`
        : `${c.variant_label ?? "One size"} is back in stock`}
    </p>
  ))}</>;
}

function eventDescription(c: ProductChange): string {
  if (c.event_type === "new") return "First seen on The Catalogue";
  if (c.event_type === "removed") return "No longer listed by the brand";
  if (c.event_type === "relisted") return "Listed again by the brand";
  return `${c.variant_label ?? "One size"} · ${LABELS[c.event_type].replace("↓ ", "")}`;
}

export function ChangeHistory({ changes }: { changes: ProductChange[] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="change-history" aria-label="Product change history">
      <h2 className="section-title">What changed</h2>
      {changes.length === 0 ? (
        <p className="muted">No recorded changes yet. Future price and stock updates will appear here.</p>
      ) : (
        <>
          <ol className="change-timeline">
            {(expanded ? changes : changes.slice(0, 5)).map((c) => (
              <li key={c.id}>
                <div>
                  <strong>{eventDescription(c)}</strong>
                  {c.old_price !== null && c.new_price !== null && c.old_price !== c.new_price && (
                    <p>{formatPrice(c.old_price)} → {formatPrice(c.new_price)}</p>
                  )}
                </div>
                <time dateTime={c.observed_at}>{formatObservedAt(c.observed_at)}</time>
              </li>
            ))}
          </ol>
          {changes.length > 5 && <button type="button" className="button button-secondary history-toggle"
            aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show fewer changes" : `Show ${changes.length - 5} more changes`}
          </button>}
          <p className="history-note">Observed during our daily checks. “New” means new to The Catalogue.
            {changes.length === 50 && " Showing the latest 50 changes."}</p>
        </>
      )}
    </section>
  );
}
