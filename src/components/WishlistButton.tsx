import { useState } from "react";

import { api } from "../api";
import { useToast } from "./Toast";

type Props = {
  productId: number;
  wishlistId: number | null;
  onChange: (wishlistId: number | null) => void;
  variant?: "icon" | "full";
};

export function WishlistButton({ productId, wishlistId, onChange, variant = "icon" }: Props) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const saved = wishlistId !== null;

  async function toggle() {
    setBusy(true);
    try {
      if (saved) {
        await api.removeFromWishlist(wishlistId);
        onChange(null);
        toast("Removed from wishlist");
      } else {
        const item = await api.addToWishlist(productId);
        onChange(item.id);
        toast("Added to wishlist");
      }
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const label = saved ? "Remove from wishlist" : "Add to wishlist";
  return (
    <button
      type="button"
      className={variant === "icon" ? "heart" : "button button-secondary"}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      disabled={busy}
      onClick={toggle}
    >
      <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
      {variant === "full" && <span>{saved ? " In wishlist" : " Add to wishlist"}</span>}
    </button>
  );
}
