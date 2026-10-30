// API client. The browser calls the FastAPI backend directly (Vercel only serves these files).
// Money values arrive as strings ("1299.00") so no precision is lost.

const API_URL = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : ""))
  .replace(/\/$/, "");

export type Page<T> = { items: T[]; total: number; page: number; page_size: number };

export type Brand = { id: number; name: string; base_url: string; product_count: number };

export type ChangeFilter = "" | "all" | "new" | "price_drop" | "restock" | "removed";
export type ProductChange = {
  id: number;
  event_type: "new" | "price_drop" | "price_increase" | "restock" | "sold_out" | "removed" | "relisted";
  variant_id: number | null;
  variant_label: string | null;
  old_price: string | null;
  new_price: string | null;
  observed_at: string;
};
export type UpdatePage = Page<ProductCard> & { last_checked_at: string | null };

export type FilterOptions = {
  sizes: string[];
  categories: string[];
  min_price: string | null;
  max_price: string | null;
  last_checked_at?: string | null;
};

export type ProductCard = {
  id: number;
  brand_id: number;
  brand_name: string;
  title: string;
  category: string;
  image_url: string | null;
  url: string;
  price: string | null;
  compare_at_price: string | null;
  discount_pct: string | null;
  in_stock: boolean;
  sizes: string[];
  is_active: boolean;
  shopify_created_at: string | null;
  wishlist_id: number | null;
  last_seen_at?: string;
  recent_changes?: ProductChange[];
};

export type Variant = {
  id: number;
  position: number | null;
  title: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  size_raw: string | null;
  size_norm: string | null;
  price: string;
  compare_at_price: string | null;
  discount_pct: string | null;
  available: boolean;
  alert_id: number | null;
};

export type ProductDetail = {
  id: number;
  brand_id: number;
  brand_name: string;
  title: string;
  category: string;
  product_type: string | null;
  tags: string[];
  body_html: string | null;
  image_urls: string[];
  options: { name: string; position: number; values: string[] }[];
  url: string;
  is_active: boolean;
  shopify_created_at: string | null;
  wishlist_id: number | null;
  variants: Variant[];
  last_seen_at?: string;
  changes?: ProductChange[];
};

export type WishlistItem = { id: number; added_at: string; product: ProductCard };

export type Alert = {
  id: number;
  status: "active" | "fired" | "cancelled";
  created_at: string;
  last_fired_at: string | null;
  variant_id: number;
  variant_title: string | null;
  size_norm: string | null;
  price: string;
  compare_at_price: string | null;
  discount_pct: string | null;
  available: boolean;
  product_id: number;
  product_title: string;
  brand_name: string;
  image_url: string | null;
  url: string;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new ApiError(0, "VITE_API_URL is not set.");
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Try again later.");
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      // keep the generic message
    }
    throw new ApiError(response.status, message);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  brands: () => request<Brand[]>("/brands"),
  filters: (brandId: number) => request<FilterOptions>(`/brands/${brandId}/filters`),
  products: (brandId: number, params: URLSearchParams) =>
    request<Page<ProductCard>>(`/brands/${brandId}/products?${params}`),
  product: (id: number) => request<ProductDetail>(`/products/${id}`),
  updates: (params: URLSearchParams) => request<UpdatePage>(`/updates?${params}`),

  wishlist: (page = 1, change: ChangeFilter = "") =>
    request<Page<WishlistItem>>(`/wishlist?page=${page}&page_size=48${change ? `&change=${change}` : ""}`),
  addToWishlist: (productId: number) =>
    request<WishlistItem>("/wishlist", { method: "POST", body: JSON.stringify({ product_id: productId }) }),
  removeFromWishlist: (wishlistId: number) => request<void>(`/wishlist/${wishlistId}`, { method: "DELETE" }),

  alerts: (page = 1) => request<Page<Alert>>(`/alerts?page=${page}&page_size=48`),
  createAlert: (variantId: number) =>
    request<Alert>("/alerts", { method: "POST", body: JSON.stringify({ variant_id: variantId }) }),
  cancelAlert: (alertId: number) => request<void>(`/alerts/${alertId}`, { method: "DELETE" }),
};
