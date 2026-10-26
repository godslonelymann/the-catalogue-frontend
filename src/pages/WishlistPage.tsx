import { useState } from "react";

import { api } from "../api";
import { Message } from "../components/Message";
import { Pagination } from "../components/Pagination";
import { ProductCard } from "../components/ProductCard";
import { useLoad } from "../useLoad";

const PAGE_SIZE = 48;

export default function WishlistPage() {
  const [page, setPage] = useState(1);
  const wishlist = useLoad(() => api.wishlist(page), [page]);

  // Removing a product from the wishlist removes its card from this page.
  function remove(productId: number) {
    wishlist.setData((data) =>
      data && { ...data, total: data.total - 1, items: data.items.filter((i) => i.product.id !== productId) },
    );
  }

  return (
    <>
      <h1>Wishlist</h1>
      {wishlist.error && <Message title="Could not load the wishlist" text={wishlist.error} />}
      {!wishlist.data && !wishlist.error && <Message title="Loading…" />}
      {wishlist.data && wishlist.data.items.length === 0 && (
        <Message title="Your wishlist is empty" text="Tap ♡ on any product to save it here." />
      )}
      {wishlist.data && wishlist.data.items.length > 0 && (
        <>
          <div className="grid">
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
