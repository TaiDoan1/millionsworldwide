"use client";

import { useState } from "react";
import { sizeOptionsFor, type Product } from "../../data/products";
import { useCart } from "../../components/CartContext";
import { formatPrice } from "../../lib/format";
import { useLanguage } from "../../lib/i18n";
import { EASE, TAG_BY_CATEGORY } from "./constants";
import {
  resolveRows,
  rowKey,
  rowName,
  rowProductId,
  rowSoldOut,
  type PieceRow,
} from "./piece-rows";

/**
 * Shopee-style set picker. On a set's detail page the customer picks
 * which pieces they want — one piece or the full set — instead of the
 * old two-step flow (buy the whole set in the buy box, pieces in a
 * separate list below).
 *
 * - All pieces selected = the set itself: set price (with the savings
 *   line when it beats the pieces' sum) and the set's one shared size.
 * - A subset = each piece at its own price, with that piece's own
 *   sizes (legacy pieces use the set's sizes).
 * - One "Thêm vào giỏ" adds everything picked at once.
 * Only renders when the set actually has pieces linked in /mw-office.
 */
export default function SetPicker({
  product,
  catalog,
}: {
  product: Product;
  catalog: Product[];
}) {
  const { t } = useLanguage();
  const { add, openCart } = useCart();
  const rows = resolveRows(product, catalog);
  // Default: the full set (every piece that can still be bought).
  const [selected, setSelected] = useState<string[]>(() =>
    rows.filter((r) => !rowSoldOut(r, product)).map((r) => rowKey(r)),
  );
  const [setSize, setSetSize] = useState<string | undefined>(undefined);
  const [pieceSizes, setPieceSizes] = useState<Record<string, string | undefined>>({});
  const [added, setAdded] = useState(false);

  const allSelected = selected.length === rows.length && rows.length > 0;
  const selectedRows = rows.filter((r) => selected.includes(rowKey(r)));
  const pieceTotal = selectedRows.reduce((s, r) => s + r.price, 0);
  const saves = pieceTotal - product.price;
  const total = allSelected ? product.price : pieceTotal;
  const setSizes = sizeOptionsFor(product);

  const sizesFor = (row: PieceRow) =>
    row.kind === "linked" ? sizeOptionsFor(row.product) : setSizes;

  const sizeOk =
    selected.length > 0 &&
    (allSelected
      ? setSizes.length === 0 || !!setSize
      : selectedRows.every((r) => {
          const sizes = sizesFor(r);
          return sizes.length === 0 || !!pieceSizes[rowKey(r)];
        }));
  const canAdd =
    !product.soldOut && selected.length > 0 && sizeOk;

  const toggle = (key: string) => {
    setSelected((prev) => {
      if (prev.includes(key)) {
        // Keep at least one piece picked — an empty set buys nothing.
        if (prev.length <= 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const handleAdd = () => {
    if (!canAdd) return;
    if (allSelected) {
      add(product.id, setSize);
    } else {
      for (const row of selectedRows) {
        add(rowProductId(row), pieceSizes[rowKey(row)]);
      }
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
    openCart();
  };

  const sizePills = (
    sizes: { label: string; soldOut?: boolean }[],
    value: string | undefined,
    onPick: (label: string) => void,
  ) => (
    <div className="mt-3 flex flex-wrap gap-2">
      {sizes.map((s) => {
        const disabled = !!s.soldOut;
        const active = value === s.label;
        return (
          <button
            key={s.label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s.label)}
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
  );

  return (
    <div>
      <span className="text-sm font-bold lowercase text-black">
        {TAG_BY_CATEGORY[product.category] ?? product.category}
      </span>
      <h1 className="mt-2 text-3xl font-bold uppercase leading-tight sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-3 text-xl font-bold">
        {allSelected && product.compareAt && (
          <span className="mr-2 font-medium text-neutral-400 line-through">
            {formatPrice(product.compareAt)}
          </span>
        )}
        {formatPrice(total)}
      </p>
      {product.preOrder && (
        <p className="mt-2 inline-block bg-[#666] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          Pre-order
        </p>
      )}

      {/* Component picker — Shopee's "Thành phần bộ" variation row */}
      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wider">
          {t("picker.title")}
        </p>
        <p className="mt-1 text-sm text-[#67645e]">{t("picker.hint")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {rows.map((row) => {
            const key = rowKey(row);
            const active = selected.includes(key);
            const soldOut = rowSoldOut(row, product);
            return (
              <button
                key={key}
                type="button"
                disabled={soldOut}
                onClick={() => toggle(key)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-700 ${EASE} ${
                  soldOut
                    ? "cursor-not-allowed border-neutral-200 bg-white text-neutral-400 line-through"
                    : active
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 bg-white text-black hover:border-black"
                }`}
              >
                <span className="uppercase">{rowName(row)}</span>
                <span className="ml-2 font-bold">{formatPrice(row.price)}</span>
                {soldOut ? t("buy.soldOutSuffix") : ""}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#67645e]">
          {allSelected ? (
            saves > 0 ? (
              t("picker.save", { saves: formatPrice(saves) })
            ) : (
              t("pieces.summary", { total: formatPrice(pieceTotal) })
            )
          ) : (
            <>
              {t("pieces.summary", { total: formatPrice(pieceTotal) })}
              {saves > 0 && (
                <>
                  {t("pieces.save", {
                    price: formatPrice(product.price),
                    saves: formatPrice(saves),
                  })}
                </>
              )}
              .
            </>
          )}
        </p>
      </div>

      {/* Size: the set's one shared size when the full set is picked,
          each piece's own sizes when only some pieces are picked. */}
      {allSelected ? (
        setSizes.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-wider">Size</p>
            {sizePills(setSizes, setSize, (label) => setSetSize(label))}
            {!setSize && (
              <p className="mt-2 text-sm text-[#67645e]">{t("buy.sizeHint")}</p>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-[12px] bg-[#f5f5f5] p-4">
            <p className="text-sm font-semibold uppercase tracking-wider">Size</p>
            <p className="mt-1 text-sm leading-relaxed text-[#67645e]">
              {t("buy.sizeNote")}
            </p>
          </div>
        )
      ) : (
        <div className="mt-6 space-y-5">
          {selectedRows.map((row) => {
            const sizes = sizesFor(row);
            if (sizes.length === 0) return null;
            const key = rowKey(row);
            const value = pieceSizes[key];
            return (
              <div key={key}>
                <p className="text-sm font-semibold uppercase tracking-wider">
                  {t("picker.sizeFor", { name: rowName(row) })}
                </p>
                {sizePills(sizes, value, (label) =>
                  setPieceSizes((prev) => ({ ...prev, [key]: label })),
                )}
                {!value && (
                  <p className="mt-2 text-sm text-[#67645e]">{t("buy.sizeHint")}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        disabled={!canAdd}
        onClick={handleAdd}
        className={`mt-6 h-[50px] w-full rounded-full bg-black text-[max(0.875rem,0.925vw)] uppercase text-white transition-opacity duration-700 ${EASE} hover:opacity-80 disabled:cursor-not-allowed disabled:bg-neutral-400`}
      >
        {product.soldOut || selected.length === 0
          ? t("card.soldOut")
          : added
            ? t("card.added")
            : t("card.add")}
      </button>
      <p className="mt-3 text-center text-sm text-[#67645e]">
        {t("buy.shipping")}
      </p>
    </div>
  );
}
