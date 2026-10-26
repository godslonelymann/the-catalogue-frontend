import { formatDiscount, formatPrice } from "../format";

type Props = { price: string | null; compareAt: string | null; discount: string | null };

export function Price({ price, compareAt, discount }: Props) {
  if (price === null) return null;
  return (
    <span className="price">
      <span className="price-now">{formatPrice(price)}</span>
      {compareAt && (
        <>
          <s className="price-was">{formatPrice(compareAt)}</s>
          <span className="price-off">{formatDiscount(discount)}</span>
        </>
      )}
    </span>
  );
}
