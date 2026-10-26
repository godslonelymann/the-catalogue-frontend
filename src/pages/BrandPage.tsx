import { useEffect } from "react";
import { NavLink, useParams, useSearchParams } from "react-router-dom";

import { api, Brand } from "../api";
import { Filters } from "../components/Filters";
import { Message } from "../components/Message";
import { Pagination } from "../components/Pagination";
import { ProductCard } from "../components/ProductCard";
import { useLoad } from "../useLoad";

const PAGE_SIZE = 24;

export default function BrandPage({ brands }: { brands: Brand[] }) {
  const brandId = Number(useParams().brandId);
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? 1) || 1;

  const filters = useLoad(() => api.filters(brandId), [brandId]);
  const products = useLoad(() => {
    const query = new URLSearchParams(params);
    query.set("page_size", String(PAGE_SIZE));
    return api.products(brandId, query);
  }, [brandId, params.toString()]);

  function updateParams(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    if (!("page" in changes)) next.delete("page"); // a new filter starts at page 1
    setParams(next);
  }

  function setWishlistId(productId: number, wishlistId: number | null) {
    products.setData((data) =>
      data && {
        ...data,
        items: data.items.map((p) => (p.id === productId ? { ...p, wishlist_id: wishlistId } : p)),
      },
    );
  }

  // On small screens the tab row scrolls: keep the active brand visible.
  useEffect(() => {
    document.querySelector(".brand-tabs a.active")?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [brandId, brands.length]);

  const brand = brands.find((b) => b.id === brandId);

  return (
    <>
      <nav className="brand-tabs" aria-label="Brands">
        {brands.map((b) => (
          <NavLink key={b.id} to={`/brands/${b.id}`}>
            {b.name}
          </NavLink>
        ))}
      </nav>

      <div className="brand-head">
        <h1>{brand?.name ?? "Brand"}</h1>
        {brand && (
          <a href={brand.base_url} target="_blank" rel="noopener noreferrer">
            Visit store ↗
          </a>
        )}
      </div>

      {/* key: new brand -> fresh filter inputs */}
      <Filters key={brandId} options={filters.data} params={params} onChange={updateParams} />

      {products.error && <Message title="Could not load products" text={products.error} />}
      {products.data && (
        <>
          <p className="result-count" aria-live="polite">
            {products.loading ? "Loading…" : `${products.data.total.toLocaleString("en-IN")} products`}
          </p>
          {products.data.items.length === 0 && !products.loading ? (
            <Message title="Nothing found" text="Try removing a filter, or untick “In stock only”." />
          ) : (
            <div className={`grid ${products.loading ? "is-loading" : ""}`}>
              {products.data.items.map((p) => (
                <ProductCard key={p.id} product={p} onWishlistChange={(id) => setWishlistId(p.id, id)} />
              ))}
            </div>
          )}
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={products.data.total}
            onPage={(n) => {
              updateParams({ page: String(n) });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
      {!products.data && !products.error && <Message title="Loading…" />}
    </>
  );
}
