import { Link } from "react-router-dom";

import { ProductCard as Card } from "../api";
import { formatDiscount, shopifyImage } from "../format";
import { Price } from "./Price";
import { WishlistButton } from "./WishlistButton";

type Props = { product: Card; onWishlistChange: (wishlistId: number | null) => void };

export function ProductCard({ product: p, onWishlistChange }: Props) {
  return (
    <article className="card">
      <Link to={`/products/${p.id}`} className="card-image">
        {p.image_url ? (
          <img src={shopifyImage(p.image_url, 500)} alt={p.title} loading="lazy" />
        ) : (
          <span className="no-image">No image</span>
        )}
        {p.discount_pct && <span className="badge badge-sale">{formatDiscount(p.discount_pct)}</span>}
        {!p.in_stock && <span className="badge badge-sold">Sold out</span>}
        {!p.is_active && <span className="badge badge-sold">No longer listed</span>}
      </Link>
      <WishlistButton productId={p.id} wishlistId={p.wishlist_id} onChange={onWishlistChange} />
      <div className="card-body">
        <Link to={`/products/${p.id}`} className="card-title">
          {p.title}
        </Link>
        <Price price={p.price} compareAt={p.compare_at_price} discount={p.discount_pct} />
        {p.sizes.length > 0 && (
          <ul className="size-chips" aria-label="Sizes in stock">
            {p.sizes.slice(0, 8).map((s) => (
              <li key={s}>{s}</li>
            ))}
            {p.sizes.length > 8 && <li>+{p.sizes.length - 8}</li>}
          </ul>
        )}
      </div>
    </article>
  );
}
