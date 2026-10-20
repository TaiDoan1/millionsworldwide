"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "../data/products";

/** Stored prices are in thousands of VND (300 -> 300,000₫), grouped with commas like the reference shop. */
function formatPrice(n: number) {
  return `${(n * 1000).toLocaleString("en-US")}₫`;
}

const TAG_BY_CATEGORY: Record<Product["category"], string> = {
  "t-shirts": "t-shirt",
  sneakers: "sneakers",
  sweatpants: "sweatpants",
};

/** The reference site's signature motion: 0.7s cubic-bezier(0.76, 0, 0.24, 1). */
const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

/**
 * Reference card behaviour:
 * - Desktop (≥820px): the photo fills a 2:3 card; category tag, name/price and origin
 *   overlay the photo (top / bottom, 1.75rem padding). On hover the second photo
 *   crossfades in, the details fade out and the add-to-cart pill slides up from below.
 * - Mobile (≤819px): stacked card on #f5f5f5 — photo on top, small tag + name below,
 *   origin hidden, a compact add-to-cart pill is always visible.
 */
export default function ProductCard({
  product,
  cols = 3,
}: {
  product: Product;
  cols?: 2 | 3;
}) {
  const [added, setAdded] = useState(false);
  const firstImage = product.images[0];
  const hoverImage = product.images[1] ?? product.images[0];
  const tag = TAG_BY_CATEGORY[product.category];

  const handleAdd = () => {
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group relative h-full overflow-hidden rounded-[12px] bg-[#f5f5f5] max-[819px]:flex max-[819px]:flex-col min-[820px]:aspect-[2/3]">
      {/* Photo — fills the whole card on desktop, a 2:3 block on mobile */}
      <div className="relative max-[819px]:aspect-[2/3] min-[820px]:absolute min-[820px]:inset-0">
        <Image
          src={firstImage}
          alt={product.name}
          fill
          sizes="(max-width: 819px) 45vw, 30vw"
          className={`object-cover transition-opacity duration-700 ${EASE} min-[820px]:group-hover:opacity-0`}
        />
        {/* Sold-out badge — centred pink circle (85px desktop / 64px mobile), covered by the hover photo */}
        {product.soldOut && (
          <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-[#d46b78] bg-[#f0a0a9] text-center text-[10px] font-semibold uppercase leading-tight tracking-[1px] text-white min-[820px]:h-[85px] min-[820px]:w-[85px] min-[820px]:text-xs min-[820px]:tracking-[1.5px]">
              Sold
              <br />
              Out
            </span>
          </div>
        )}
        {/* Hover photo crossfades over the first one (desktop only) */}
        <Image
          src={hoverImage}
          alt=""
          aria-hidden
          fill
          sizes="30vw"
          className={`z-10 object-cover opacity-0 transition-opacity duration-700 ${EASE} group-hover:opacity-100 max-[819px]:hidden`}
        />
      </div>

      {/* Content — overlay on desktop, static block under the photo on mobile */}
      <div className="flex flex-col justify-between max-[819px]:flex-1 max-[819px]:p-[0.5rem_0.625rem_0.625rem] min-[820px]:pointer-events-none min-[820px]:absolute min-[820px]:inset-0 min-[820px]:z-20 min-[820px]:p-[1rem_0.75rem] min-[1200px]:p-[1.75rem]">
        {/* Category tag */}
        <div className="flex items-start justify-between gap-2">
          <span
            className={`font-bold lowercase leading-[1.1] text-black max-[819px]:text-[clamp(0.75rem,3vw,0.875rem)] ${
              cols === 3
                ? "min-[820px]:text-[3.5vw]"
                : "min-[820px]:text-[clamp(1.125rem,1.389vw,1.5rem)]"
            }`}
          >
            {tag}
          </span>
          {product.preOrder && (
            <span className="whitespace-nowrap bg-[#666] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Pre-order
            </span>
          )}
        </div>

        {/* Name / price / origin — fades out on hover (desktop) */}
        <div
          className={`transition-opacity duration-700 ${EASE} min-[820px]:group-hover:opacity-0`}
        >
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`font-semibold uppercase leading-[1.25] text-black max-[819px]:text-[clamp(0.75rem,3.2vw,1rem)] ${
                cols === 3
                  ? "min-[820px]:text-[max(1rem,1.25vw)]"
                  : "min-[820px]:text-[clamp(0.75rem,1.25vw,1.375rem)]"
              }`}
            >
              {product.name}
            </h3>
            <span
              className={`whitespace-nowrap font-bold text-black max-[819px]:text-[clamp(0.75rem,3.2vw,1rem)] ${
                cols === 3
                  ? "min-[820px]:text-[max(1rem,1.25vw)]"
                  : "min-[820px]:text-[clamp(0.75rem,1.25vw,1.375rem)]"
              }`}
            >
              {product.compareAt && (
                <span className="mr-2 font-medium text-neutral-400 line-through">
                  {formatPrice(product.compareAt)}
                </span>
              )}
              {formatPrice(product.price)}
            </span>
          </div>
          <p className="mt-1 text-base text-[#67645e] max-[819px]:hidden">
            Xuất xứ: Việt Nam
          </p>

          {/* Mobile: compact pill is always visible */}
          <button
            type="button"
            disabled={product.soldOut}
            onClick={handleAdd}
            className="mt-2 h-9 w-full rounded-full bg-black text-xs font-semibold uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:bg-neutral-400 min-[820px]:hidden"
          >
            {product.soldOut ? "Sold Out" : added ? "Đã thêm ✓" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>

      {/* Desktop: add-to-cart pill slides up from below on hover */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 hidden translate-y-[150%] p-[1rem_0.75rem] transition-transform duration-700 ${EASE} group-hover:translate-y-0 min-[820px]:block`}
      >
        <button
          type="button"
          disabled={product.soldOut}
          onClick={handleAdd}
          className="pointer-events-auto h-[50px] w-full rounded-full bg-black text-[max(0.875rem,0.925vw)] uppercase text-white disabled:cursor-not-allowed"
        >
          {product.soldOut ? "Sold Out" : added ? "Đã thêm ✓" : "Thêm vào giỏ"}
        </button>
      </div>
    </article>
  );
}
