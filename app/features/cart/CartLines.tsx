import Image from "next/image";
import type { CartLine } from "../../components/CartContext";
import { formatPrice } from "../../lib/format";
import { useLanguage } from "../../lib/i18n";

/** Cart item rows with quantity steppers and per-line totals. */
export default function CartLines({
  lines,
  onQty,
  onRemove,
}: {
  lines: CartLine[];
  onQty: (id: string, qty: number, size?: string, color?: string) => void;
  onRemove: (id: string, size?: string, color?: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      {lines.map(({ product, qty, size, color }) => (
        <div key={`${product.id}::${size ?? ""}::${color ?? ""}`} className="flex gap-4 border-b border-neutral-100 py-4">
          <div className="relative h-24 w-[72px] shrink-0 overflow-hidden rounded-[12px] bg-neutral-100">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="72px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold uppercase leading-snug text-black">
                {product.name}
              </p>
              <button
                type="button"
                onClick={() => onRemove(product.id, size, color)}
                aria-label={t("cart.remove", { name: product.name })}
                className="text-lg leading-none text-neutral-400 hover:text-black"
              >
                ×
              </button>
            </div>
            <p className="mt-0.5 text-sm text-neutral-500">
              {formatPrice(product.price)}
              {size ? ` · Size ${size}` : ""}
              {color ? ` · ${t("cart.color", { color })}` : ""}
            </p>
            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="flex items-center border border-neutral-300 rounded-full">
                <button
                  type="button"
                  onClick={() => onQty(product.id, qty - 1, size, color)}
                  className="h-8 w-8 text-black"
                  aria-label={t("cart.decrease")}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold text-black">{qty}</span>
                <button
                  type="button"
                  onClick={() => onQty(product.id, qty + 1, size, color)}
                  className="h-8 w-8 text-black"
                  aria-label={t("cart.increase")}
                >
                  +
                </button>
              </div>
              <p className="text-sm font-bold text-black">
                {formatPrice(product.price * qty)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
