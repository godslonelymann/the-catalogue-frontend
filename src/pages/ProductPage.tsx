import DOMPurify from "dompurify";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api, ProductDetail, Variant } from "../api";
import { Message } from "../components/Message";
import { Price } from "../components/Price";
import { useToast } from "../components/Toast";
import { WishlistButton } from "../components/WishlistButton";
import { shopifyImage, sizeLabel } from "../format";
import { useLoad } from "../useLoad";

// The description is the store's own HTML (often with a size chart table). Clean it before showing it.
function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ["style", "script", "iframe", "form", "input", "button", "video", "object", "embed"],
    FORBID_ATTR: ["style", "class", "id"],
  });
}

/** Price shown at the top: cheapest in-stock variant, else cheapest variant. */
function mainVariant(variants: Variant[]): Variant | undefined {
  const sorted = [...variants].sort((a, b) => Number(a.price) - Number(b.price));
  return sorted.find((v) => v.available) ?? sorted[0];
}

export default function ProductPage() {
  const productId = Number(useParams().productId);
  const product = useLoad(() => api.product(productId), [productId]);
  const [imageIndex, setImageIndex] = useState(0);
  const description = useMemo(
    () => (product.data?.body_html ? sanitize(product.data.body_html) : ""),
    [product.data?.body_html],
  );

  if (product.error) return <Message title="Could not load this product" text={product.error} />;
  if (!product.data) return <Message title="Loading…" />;

  const p = product.data;
  const update = (changes: Partial<ProductDetail>) => product.setData({ ...p, ...changes });
  const main = mainVariant(p.variants);
  const image = p.image_urls[imageIndex] ?? p.image_urls[0];

  return (
    <article className="product">
      <div className="gallery">
        <div className="gallery-main">
          {image ? <img src={shopifyImage(image, 900)} alt={p.title} /> : <span className="no-image">No image</span>}
        </div>
        {p.image_urls.length > 1 && (
          <div className="gallery-thumbs">
            {p.image_urls.map((url, i) => (
              <button
                type="button"
                key={url}
                className={i === imageIndex ? "active" : ""}
                onClick={() => setImageIndex(i)}
                aria-label={`Image ${i + 1}`}
              >
                <img src={shopifyImage(url, 160)} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-info">
        <Link to={`/brands/${p.brand_id}`} className="product-brand">
          {p.brand_name}
        </Link>
        <h1>{p.title}</h1>
        {main && <Price price={main.price} compareAt={main.compare_at_price} discount={main.discount_pct} />}
        {!p.is_active && <p className="notice">This product is no longer listed on the store.</p>}

        <h2 className="section-title">Sizes</h2>
        <SizeList variants={p.variants} onChange={(variants) => update({ variants })} />

        <div className="product-actions">
          <WishlistButton
            productId={p.id}
            wishlistId={p.wishlist_id}
            onChange={(wishlist_id) => update({ wishlist_id })}
            variant="full"
          />
          <a className="button" href={p.url} target="_blank" rel="noopener noreferrer">
            View on {p.brand_name} ↗
          </a>
        </div>

        {description && (
          <>
            <h2 className="section-title">Description</h2>
            <div className="description" dangerouslySetInnerHTML={{ __html: description }} />
          </>
        )}
      </div>
    </article>
  );
}

function SizeList({ variants, onChange }: { variants: Variant[]; onChange: (v: Variant[]) => void }) {
  const toast = useToast();
  const [busyId, setBusyId] = useState<number | null>(null);

  // When two variants share a size (e.g. "M / Black" and "M / White"), show the full variant title.
  const sizeCounts = new Map<string, number>();
  variants.forEach((v) => sizeCounts.set(sizeLabel(v), (sizeCounts.get(sizeLabel(v)) ?? 0) + 1));
  const label = (v: Variant) => ((sizeCounts.get(sizeLabel(v)) ?? 0) > 1 && v.title ? v.title : sizeLabel(v));

  const setAlertId = (variantId: number, alertId: number | null) =>
    onChange(variants.map((v) => (v.id === variantId ? { ...v, alert_id: alertId } : v)));

  async function toggleAlert(v: Variant) {
    setBusyId(v.id);
    try {
      if (v.alert_id) {
        await api.cancelAlert(v.alert_id);
        setAlertId(v.id, null);
        toast("Alert removed");
      } else {
        const alert = await api.createAlert(v.id);
        setAlertId(v.id, alert.id);
        toast(`Alert set for ${label(v)}. You will get a Telegram message when it is back.`);
      }
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (variants.length === 0) return <p className="muted">No sizes listed.</p>;

  return (
    <ul className="size-list">
      {variants.map((v) => (
        <li key={v.id} className={v.available ? "in-stock" : "sold-out"}>
          <span className="size-name">{label(v)}</span>
          <span className="size-status">{v.available ? "In stock" : "Sold out"}</span>
          {!v.available && (
            <button
              type="button"
              className={v.alert_id ? "alert-on" : "alert-off"}
              disabled={busyId === v.id}
              onClick={() => toggleAlert(v)}
            >
              {v.alert_id ? "🔔 Alert on" : "Alert me"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
