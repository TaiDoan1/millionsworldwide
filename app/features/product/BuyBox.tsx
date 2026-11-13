import { useState } from "react";
import { sizeOptionsFor, type Product } from "../../data/products";
import { formatPrice } from "../../lib/format";
import { useLanguage } from "../../lib/i18n";
import { EASE, TAG_BY_CATEGORY } from "./constants";

/** Sticky buy column: tag, name, price, size picker/note, add button, shipping note. */
export default function BuyBox({
  product,
  added,
  onAdd,
}: {
  product: Product;
  added: boolean;
  onAdd: (size?: string) => void;
}) {
  const sizes = sizeOptionsFor(product);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const sizeRequired = sizes.length > 0;
  const canAdd = !product.soldOut && (!sizeRequired || !!selectedSize);
  const { t } = useLanguage();
  return (
    <div>
      <span className="text-sm font-bold lowercase text-black">
        {TAG_BY_CATEGORY[product.category] ?? product.category}
      </span>
      <h1 className="mt-2 text-3xl font-bold uppercase leading-tight sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-3 text-xl font-bold">
        {product.compareAt && (
          <span className="mr-2 font-medium text-neutral-400 line-through">
            {formatPrice(product.compareAt)}
          </span>
        )}
        {formatPrice(product.price)}
      </p>
      {product.preOrder && (
        <p className="mt-2 inline-block bg-[#666] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          Pre-order
        </p>
      )}

      {sizes.length > 0 ? (
        /* Per-size picker — only shown when the shop has supplied a real
           size list in products.ts. Sold-out sizes are locked. */
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider">Size</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const disabled = !!s.soldOut;
              const active = selectedSize === s.label;
              return (
                <button
                  key={s.label}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedSize(s.label)}
                  aria-pressed={active}
                  className={`h-11 min-w-11 rounded-full border px-4 text-sm font-semibold transition-colors duration-700 ${EASE} ${
                    disabled
                      ? "cursor-not-allowed border-neutral-200 text-neutral-400 line-through"
                      : active
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 bg-white text-black hover:border-black"
                  }`}
                >
                  {s.label}
                  {disabled ? t("buy.soldOutSuffix") : ""}
                </button>
              );
            })}
          </div>
          {!selectedSize && (
            <p className="mt-2 text-sm text-[#67645e]">{t("buy.sizeHint")}</p>
          )}
        </div>
      ) : (
        /* Size note — the shop confirms size by phone, so no size
           picker is invented here; the note keeps the flow honest. */
        <div className="mt-6 rounded-[12px] bg-[#f5f5f5] p-4">
          <p className="text-sm font-semibold uppercase tracking-wider">Size</p>
          <p className="mt-1 text-sm leading-relaxed text-[#67645e]">
            {t("buy.sizeNote")}
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={!canAdd}
        onClick={() => onAdd(selectedSize)}
        className={`mt-6 h-[50px] w-full rounded-full bg-black text-[max(0.875rem,0.925vw)] uppercase text-white transition-opacity duration-700 ${EASE} hover:opacity-80 disabled:cursor-not-allowed disabled:bg-neutral-400`}
      >
        {product.soldOut ? t("card.soldOut") : added ? t("card.added") : t("card.add")}
      </button>
      <p className="mt-3 text-center text-sm text-[#67645e]">
        {t("buy.shipping")}
      </p>
    </div>
  );
}
