"use client";

import { useState } from "react";
import {
  isSizeSoldOut,
  sizeOptionsFor,
  type Product,
  type ProductPiece,
} from "../../data/products";
import { useCart } from "../../components/CartContext";
import { formatPrice } from "../../lib/format";
import { EASE } from "./constants";

/**
 * "Mua lẻ từng món" on a set's detail page: each piece of the set at
 * its own price, with its own add-to-cart button. Only renders when
 * the set actually has pieces — an empty list means the set is sold
 * as a whole, nothing is invented here.
 */
export default function PieceBuyList({ product }: { product: Product }) {
  const pieces = product.pieces ?? [];
  if (pieces.length === 0) return null;

  const pieceTotal = pieces.reduce((s, pc) => s + pc.price, 0);
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
        {pieces.map((piece) => (
          <PieceRow key={piece.id} product={product} piece={piece} />
        ))}
      </div>
    </div>
  );
}

function PieceRow({
  product,
  piece,
}: {
  product: Product;
  piece: ProductPiece;
}) {
  const { add } = useCart();
  const sizes = sizeOptionsFor(product);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined,
  );
  const [added, setAdded] = useState(false);
  const sizeRequired = sizes.length > 0;
  const canAdd =
    !product.soldOut && (!sizeRequired || !!selectedSize);

  function handleAdd() {
    add(piece.id, selectedSize);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[12px] bg-[#f5f5f5] p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold lowercase">{piece.name}</p>
        <p className="mt-0.5 text-sm font-bold">{formatPrice(piece.price)}</p>
      </div>
      {sizes.length > 0 && (
        <select
          value={selectedSize ?? ""}
          onChange={(e) =>
            setSelectedSize(e.target.value || undefined)
          }
          aria-label={`Size cho ${piece.name}`}
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
        {product.soldOut ? "Hết hàng" : added ? "Đã thêm ✓" : "Thêm vào giỏ"}
      </button>
      {sizeRequired && !selectedSize && (
        <p className="w-full text-xs text-[#67645e]">Chọn size trước khi thêm.</p>
      )}
    </div>
  );
}
