"use client";

import { useState } from "react";
import Link from "next/link";
import {
  isLinkedPiece,
  sizeOptionsFor,
  type Product,
} from "../../data/products";
import { useCart } from "../../components/CartContext";
import { formatPrice } from "../../lib/format";
import { EASE } from "./constants";

/**
 * "Mua lẻ từng món" on a set's detail page: each piece is a link to a
 * standalone product — the row shows that product (photo, name, price,
 * its own sizes) and adding it puts the product itself in the cart, so
 * the set page and the product's own page can never disagree on price
 * or stock. A legacy inline piece (saved before linking) still renders
 * with the set's sizes. Pieces whose linked product is gone or hidden
 * are skipped. Only renders when the set actually has pieces.
 */
export default function PieceBuyList({
  product,
  catalog,
}: {
  product: Product;
  catalog: Product[];
}) {
  const rows = resolveRows(product, catalog);
  if (rows.length === 0) return null;

  const pieceTotal = rows.reduce((s, r) => s + r.price, 0);
  const saves = pieceTotal - product.price;

  return (
    <div className="mt-8 border-t border-neutral-200 pt-6">
      <p className="text-sm font-semibold uppercase tracking-wider">
        Mua lẻ từng món
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[#67645e]">
        Mua lẻ tổng {formatPrice(pieceTotal)}
        {saves > 0 && (
          <>
            {" · "}mua cả set {formatPrice(product.price)} (tiết kiệm{" "}
            {formatPrice(saves)})
          </>
        )}
        .
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {rows.map((row) =>
          row.kind === "linked" ? (
            <LinkedRow key={row.product.id} linked={row.product} />
          ) : (
            <LegacyRow key={row.id} set={product} row={row} />
          ),
        )}
      </div>
    </div>
  );
}

type Row =
  | { kind: "linked"; product: Product; price: number }
  | { kind: "legacy"; id: string; name: string; price: number };

function resolveRows(set: Product, catalog: Product[]): Row[] {
  const rows: Row[] = [];
  for (const piece of set.pieces ?? []) {
    if (isLinkedPiece(piece)) {
      const linked = catalog.find((p) => p.id === piece.productId);
      if (linked) {
        rows.push({ kind: "linked", product: linked, price: linked.price });
      }
      // Gone or hidden from the visible catalog: skip the row.
    } else if (
      typeof piece.id === "string" &&
      typeof piece.name === "string" &&
      typeof piece.price === "number"
    ) {
      rows.push({
        kind: "legacy",
        id: piece.id,
        name: piece.name,
        price: piece.price,
      });
    }
  }
  return rows;
}

function LinkedRow({ linked }: { linked: Product }) {
  const { add } = useCart();
  const sizes = sizeOptionsFor(linked);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined,
  );
  const [added, setAdded] = useState(false);
  const sizeRequired = sizes.length > 0;
  const canAdd = !linked.soldOut && (!sizeRequired || !!selectedSize);

  function handleAdd() {
    add(linked.id, selectedSize);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[12px] bg-[#f5f5f5] p-4">
      {linked.images[0] && (
        /* Plain img on purpose: product photos are served by the
           /uploads route or public/, outside next/image's local set. */
        <img
          src={linked.images[0]}
          alt={linked.name}
          className="h-14 w-14 rounded-sm border border-neutral-200 object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <Link
          href={`/trangchu/${linked.id}`}
          className="text-sm font-bold lowercase hover:opacity-60"
        >
          {linked.name}
        </Link>
        <p className="mt-0.5 text-sm font-bold">{formatPrice(linked.price)}</p>
      </div>
      {sizes.length > 0 && (
        <select
          value={selectedSize ?? ""}
          onChange={(e) => setSelectedSize(e.target.value || undefined)}
          aria-label={`Size cho ${linked.name}`}
          className="h-10 rounded-full border border-neutral-300 bg-white px-3 text-sm font-semibold focus:outline-none focus:border-black"
        >
          <option value="">Size</option>
          {sizes.map((s) => (
            <option key={s.label} value={s.label} disabled={!!s.soldOut}>
              {s.label}
              {s.soldOut ? " (hết)" : ""}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        disabled={!canAdd}
        onClick={handleAdd}
        className={`h-10 rounded-full bg-black px-5 text-xs font-bold uppercase text-white transition-opacity duration-700 ${EASE} hover:opacity-80 disabled:cursor-not-allowed disabled:bg-neutral-400`}
      >
        {linked.soldOut ? "Hết hàng" : added ? "Đã thêm ✓" : "Thêm vào giỏ"}
      </button>
      {sizeRequired && !selectedSize && (
        <p className="w-full text-xs text-[#67645e]">Chọn size trước khi thêm.</p>
      )}
    </div>
  );
}

function LegacyRow({
  set,
  row,
}: {
  set: Product;
  row: Extract<Row, { kind: "legacy" }>;
}) {
  const { add } = useCart();
  const sizes = sizeOptionsFor(set);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined,
  );
  const [added, setAdded] = useState(false);
  const sizeRequired = sizes.length > 0;
  const canAdd = !set.soldOut && (!sizeRequired || !!selectedSize);

  function handleAdd() {
    add(row.id, selectedSize);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[12px] bg-[#f5f5f5] p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold lowercase">{row.name}</p>
        <p className="mt-0.5 text-sm font-bold">{formatPrice(row.price)}</p>
      </div>
      {sizes.length > 0 && (
        <select
          value={selectedSize ?? ""}
          onChange={(e) => setSelectedSize(e.target.value || undefined)}
          aria-label={`Size cho ${row.name}`}
          className="h-10 rounded-full border border-neutral-300 bg-white px-3 text-sm font-semibold focus:outline-none focus:border-black"
        >
          <option value="">Size</option>
          {sizes.map((s) => (
            <option key={s.label} value={s.label} disabled={!!s.soldOut}>
              {s.label}
              {s.soldOut ? " (hết)" : ""}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        disabled={!canAdd}
        onClick={handleAdd}
        className={`h-10 rounded-full bg-black px-5 text-xs font-bold uppercase text-white transition-opacity duration-700 ${EASE} hover:opacity-80 disabled:cursor-not-allowed disabled:bg-neutral-400`}
      >
        {set.soldOut ? "Hết hàng" : added ? "Đã thêm ✓" : "Thêm vào giỏ"}
      </button>
      {sizeRequired && !selectedSize && (
        <p className="w-full text-xs text-[#67645e]">Chọn size trước khi thêm.</p>
      )}
    </div>
  );
}
