import { useSearchParams } from "react-router-dom";

import { api, ChangeFilter } from "../api";
import { ChangeFilters } from "../components/ChangeFilters";
import { Message } from "../components/Message";
import { Pagination } from "../components/Pagination";
import { ProductCard } from "../components/ProductCard";
import { useLoad } from "../useLoad";

const PAGE_SIZE = 48;

export default function WishlistPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const change = (params.get("change") ?? "") as ChangeFilter;
  const wishlist = useLoad(() => api.wishlist(page, change), [page, change]);
  function setPage(n: number) {
    const next = new URLSearchParams(params); next.set("page", String(n)); setParams(next);
  }

  // Removing a product from the wishlist removes its card from this page.
  function remove(productId: number) {
    if (wishlist.data?.items.length === 1 && page > 1) { setPage(page - 1); return; }
    wishlist.setData((data) =>
      data && { ...data, total: data.total - 1, items: data.items.filter((i) => i.product.id !== productId) },
    );
  }

  return (
    <>
      <h1>Wishlist</h1>
      <p className="muted wishlist-intro">The latest changes to your saved finds.</p>
      <ChangeFilters wishlist value={change} onChange={(value) => {
        const next = new URLSearchParams(params); next.delete("page");
        if (value) next.set("change", value); else next.delete("change");
        setParams(next);
      }} />
      {change && <p className="updates-explainer">{change === "removed"
        ? "Products no longer listed by the brand stay in your wishlist."
        : "Updates from the last 7 days."}</p>}
      {wishlist.error && <Message title="Could not load the wishlist" text={wishlist.error} />}
      {!wishlist.data && !wishlist.error && <Message title="Loading…" />}
      {wishlist.data && !wishlist.loading && !wishlist.error && wishlist.data.items.length === 0 && (
        <Message title={change ? "No matching updates" : "Your wishlist is empty"} text={change
          ? "Try another change type or choose All saved."
          : "Tap ♡ on any product to save it here."} />
      )}
      {wishlist.data && !wishlist.error && wishlist.data.items.length > 0 && (
        <>
          <div className={`grid ${wishlist.loading ? "is-loading" : ""}`} aria-busy={wishlist.loading}>
            {wishlist.data.items.map((item) => (
              <ProductCard
                key={item.id}
                product={item.product}
                onWishlistChange={(id) => id === null && remove(item.product.id)}
              />
            ))}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={wishlist.data.total} onPage={setPage} />
        </>
      )}
    </>
  );
}
