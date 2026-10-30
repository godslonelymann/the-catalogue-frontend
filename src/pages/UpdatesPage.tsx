import { useSearchParams } from "react-router-dom";

import { api, Brand } from "../api";
import { ChangeFilters } from "../components/ChangeFilters";
import { Message } from "../components/Message";
import { Pagination } from "../components/Pagination";
import { ProductCard } from "../components/ProductCard";
import { formatObservedAt } from "../format";
import { useLoad } from "../useLoad";

const PAGE_SIZE = 24;

export default function UpdatesPage({ brands }: { brands: Brand[] }) {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const updates = useLoad(() => {
    const query = new URLSearchParams(params); query.set("page_size", String(PAGE_SIZE));
    return api.updates(query);
  }, [params.toString()]);
  function filter(changes: Record<string, string>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    setParams(next);
  }
  const checked = updates.data?.last_checked_at;
  return (
    <>
      <div className="updates-head">
        <div><p className="updates-kicker">THE LATEST, WITHOUT THE SEARCH</p>
          <h1>Good things have changed.</h1>
          <p className="muted">New arrivals, better prices, and sizes worth coming back for.</p></div>
        {checked && <p className="catalogue-freshness">Last checked<time dateTime={checked}>{formatObservedAt(checked)}</time></p>}
      </div>
      <div className="updates-toolbar">
        <ChangeFilters value={params.get("change") ?? "all"} onChange={(change) => filter({ change })} />
        <select aria-label="Brand" value={params.get("brand_id") ?? ""} onChange={(e) => filter({ brand_id: e.target.value })}>
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <p className="updates-explainer">Updates from the last 7 days · New means first seen on The Catalogue.</p>
      {updates.error && <Message title="Could not load recent updates" text={updates.error} />}
      {!updates.data && !updates.error && <Message title="Loading updates…" />}
      {updates.data && !updates.error && <>
        <p className="result-count" aria-live="polite">{updates.loading ? "Loading…" : `${updates.data.total.toLocaleString("en-IN")} products with recent updates`}</p>
        {updates.data.items.length === 0 && !updates.loading
          ? <Message title="No recent updates" text="Try another brand or change type. New updates will appear after the daily catalogue check." />
          : <div className={`grid ${updates.loading ? "is-loading" : ""}`} aria-busy={updates.loading}>
            {updates.data.items.map((p) => <ProductCard key={p.id} product={p} onWishlistChange={(wishlist_id) => {
              updates.setData((data) => data && { ...data, items: data.items.map((item) => item.id === p.id ? { ...item, wishlist_id } : item) });
            }} />)}
          </div>}
        <Pagination page={page} pageSize={PAGE_SIZE} total={updates.data.total} onPage={(n) => {
          const next = new URLSearchParams(params); next.set("page", String(n)); setParams(next);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }} />
      </>}
    </>
  );
}
