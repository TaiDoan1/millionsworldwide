"use client";

import { useState } from "react";
import {
  colorOptionsFor,
  sizeOptionsFor,
  type Product,
  type ProductColor,
} from "../../data/products";
import { useCart } from "../../components/CartContext";
import { formatPrice } from "../../lib/format";
import { useLanguage } from "../../lib/i18n";
import { EASE, TAG_BY_CATEGORY } from "./constants";
import {
  galleryImagesFor,
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
 * separate list below). Three steps, in order:
 *
 * 1. Pick pieces in "Thành phần bộ" — no size here. Nothing is picked
 *    by default, and leaving it empty buys the full set.
 * 2. Pick a color in ONE frame below: the set's colors when the full
 *    set is picked, that piece's own colors when a single piece is
 *    picked. (A partial pick of 2+ pieces from a 3+ piece set falls
 *    back to one color row per piece — no such set exists in the
 *    catalog today, all sets have 2 pieces.) Picking a color with its
 *    own photos swaps the gallery to them.
 * 3. Pick size in ONE frame below: the set's shared size when the full
 *    set is picked, that piece's own sizes when a single piece is
 *    picked. (Same fallback as color for a partial multi-piece pick.)
 * - All pieces selected = the set itself: set price (with the savings
 *   line when it beats the pieces' sum).
 * - A subset = each piece at its own price.
 * - One "Thêm vào giỏ" adds everything picked at once.
 * The gallery follows the selection (via onGalleryImages): a single
 * linked piece shows that piece's photos, a picked color with photos
 * comes next, anything else shows the set's photos. Only renders when
 * the set actually has pieces linked in /mw-office.
 */
export default function SetPicker({
  product,
  catalog,
  onGalleryImages,
}: {
  product: Product;
  catalog: Product[];
  /** Called whenever the selection changes, with the photos the gallery should show. */
  onGalleryImages?: (images: string[]) => void;
}) {
  const { t } = useLanguage();
  const { add, openCart } = useCart();
  const rows = resolveRows(product, catalog);
  // Default: nothing picked — the customer chooses first.
  const [selected, setSelected] = useState<string[]>([]);
  const [size, setSize] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  // Only for the partial 2+ piece fallback (see below); the normal
  // full-set / single-piece flows share the one `size` / `color` above.
  const [pieceSizes, setPieceSizes] = useState<Record<string, string | undefined>>({});
  const [pieceColors, setPieceColors] = useState<Record<string, string | undefined>>({});
  const [added, setAdded] = useState(false);

  const allSelected = selected.length === rows.length && rows.length > 0;
  const selectedRows = rows.filter((r) => selected.includes(rowKey(r)));
  // Empty selection = the full set: set price, set sizes, set photos.
  const isFullSet = allSelected || selectedRows.length === 0;
  const pieceTotal = selectedRows.reduce((s, r) => s + r.price, 0);
  const saves = pieceTotal - product.price;
  const total = isFullSet ? product.price : pieceTotal;
  // Sum of the pieces that can still be bought — the savings baseline
  // for the full set, whether picked piece by piece or left empty.
  const buyableTotal = rows
    .filter((r) => !rowSoldOut(r, product))
    .reduce((s, r) => s + r.price, 0);
  const fullSetSaves = buyableTotal - product.price;
  const setSizes = sizeOptionsFor(product);
  const setColors = colorOptionsFor(product);

  const sizesFor = (row: PieceRow) =>
    row.kind === "linked" ? sizeOptionsFor(row.product) : setSizes;

  const colorsFor = (row: PieceRow): ProductColor[] =>
    row.kind === "linked" ? colorOptionsFor(row.product) : setColors;

  // The single size frame's options: set sizes for the full set (all
  // picked, or nothing picked), the one piece's sizes for a single
  // piece. Null = partial multi-piece pick, which keeps one size row
  // per piece instead.
  const selectionSizes =
    selectedRows.length === 0 || allSelected
      ? setSizes
      : selectedRows.length === 1
        ? sizesFor(selectedRows[0])
        : null;

  // Same shape for colors: the set's colors for the full set, the one
  // piece's colors for a single piece, per-piece rows otherwise.
  const selectionColors =
    selectedRows.length === 0 || allSelected
      ? setColors
      : selectedRows.length === 1
        ? colorsFor(selectedRows[0])
        : null;

  const sizeOk =
    selectionSizes !== null
      ? selectionSizes.length === 0 || !!size
      : selectedRows.every((r) => {
          const sizes = sizesFor(r);
          return sizes.length === 0 || !!pieceSizes[rowKey(r)];
        });
  const colorOk =
    selectionColors !== null
      ? selectionColors.length === 0 || !!color
      : selectedRows.every((r) => {
          const colors = colorsFor(r);
          return colors.length === 0 || !!pieceColors[rowKey(r)];
        });
  const canAdd = !product.soldOut && sizeOk && colorOk;

  // Photos for a color in the active (single-frame) list, if it has any.
  const activeColorImages = (label: string): string[] | null => {
    if (selectionColors === null) return null;
    const found = selectionColors.find((c) => c.label === label);
    return found?.images && found.images.length > 0 ? found.images : null;
  };

  const pickColor = (label: string) => {
    setColor(label);
    onGalleryImages?.(
      galleryImagesFor(product, rows, selected, activeColorImages(label)),
    );
  };

  const toggle = (key: string) => {
    // Empty is allowed now — nothing is picked by default.
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    // A different selection can mean different sizes (set sizes vs a
    // piece's sizes), so a picked size never carries over.
    setSize(undefined);
    setColor(undefined);
    setPieceSizes({});
    setPieceColors({});
    setSelected(next);
    onGalleryImages?.(galleryImagesFor(product, rows, next));
  };

  const handleAdd = () => {
    if (!canAdd) return;
    if (allSelected || selectedRows.length === 0) {
      add(product.id, size, color);
    } else if (selectedRows.length === 1) {
      add(rowProductId(selectedRows[0]), size, color);
    } else {
      for (const row of selectedRows) {
        add(rowProductId(row), pieceSizes[rowKey(row)], pieceColors[rowKey(row)]);
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

  const colorSwatches = (
    colors: ProductColor[],
    value: string | undefined,
    onPick: (label: string) => void,
  ) => (
    <div className="mt-3 flex flex-wrap gap-2">
      {colors.map((c) => {
        const disabled = !!c.soldOut;
        const active = value === c.label;
        return (
          <button
            key={c.label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(c.label)}
            aria-pressed={active}
            className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-700 ${EASE} ${
              disabled
                ? "cursor-not-allowed border-neutral-200 text-neutral-400 line-through"
                : active
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 bg-white text-black hover:border-black"
            }`}
          >
            {c.hex && (
              <span
                aria-hidden
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
            )}
            {c.label}
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
          {isFullSet ? (
            fullSetSaves > 0 ? (
              t("picker.save", { saves: formatPrice(fullSetSaves) })
            ) : (
              t("pieces.summary", { total: formatPrice(buyableTotal) })
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

      {/* Step 2 — color, AFTER picking pieces: one frame only. Full set
          takes the set's colors, a single piece takes that piece's
          colors. Picking a color with its own photos swaps the gallery
          to them. Nothing picked yet still shows the set's colors —
          empty means the full set. */}
      {selectionColors !== null ? (
        selectionColors.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-wider">
              {t("buy.colorTitle")}
            </p>
            {colorSwatches(selectionColors, color, (label) => pickColor(label))}
            {!color && (
              <p className="mt-2 text-sm text-[#67645e]">{t("buy.colorHint")}</p>
            )}
          </div>
        ) : null
      ) : (
        <div className="mt-6 space-y-5">
          {selectedRows.map((row) => {
            const colors = colorsFor(row);
            if (colors.length === 0) return null;
            const key = rowKey(row);
            const value = pieceColors[key];
            return (
              <div key={key}>
                <p className="text-sm font-semibold uppercase tracking-wider">
                  {t("picker.colorFor", { name: rowName(row) })}
                </p>
                {colorSwatches(colors, value, (label) =>
                  setPieceColors((prev) => ({ ...prev, [key]: label })),
                )}
                {!value && (
                  <p className="mt-2 text-sm text-[#67645e]">{t("buy.colorHint")}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Step 3 — size, AFTER picking pieces: one frame only. Full set
          takes the set's shared size, a single piece takes that piece's
          sizes. The piece picker above never shows size. Nothing picked
          yet still shows the set's size frame — empty means the full set. */}
      {selectionSizes !== null ? (
        selectionSizes.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-wider">Size</p>
            {sizePills(selectionSizes, size, (label) => setSize(label))}
            {!size && (
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
        {product.soldOut
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
