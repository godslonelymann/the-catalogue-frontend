const inr0 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

/** "1299.00" -> "₹1,299"; "1299.50" -> "₹1,299.50". Display only: no maths on these values. */
export function formatPrice(value: string | null): string {
  if (value === null) return "";
  const n = Number(value);
  return Number.isInteger(n) ? inr0.format(n) : inr2.format(n);
}

export function formatDiscount(pct: string | null): string {
  return pct === null ? "" : `-${Math.round(Number(pct))}%`;
}

/** Ask Shopify's CDN for a smaller image. The image still loads from Shopify (never re-hosted). */
export function shopifyImage(url: string | null, width: number): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("shopify.com") || u.pathname.includes("/cdn/shop/")) {
      u.searchParams.set("width", String(width));
    }
    return u.toString();
  } catch {
    return url;
  }
}

export function sizeLabel(v: { size_norm: string | null; title: string | null }): string {
  if (v.size_norm) return v.size_norm;
  if (!v.title || v.title === "Default Title") return "One size";
  return v.title;
}

export function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
