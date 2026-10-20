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

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const firstImage = product.images[0];
  const hoverImage = product.images[1] ?? product.images[0];
  const tag = TAG_BY_CATEGORY[product.category];

  const handleAdd = () => {
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group">
      {/* Category tag overlapping the top of the image */}
      <div className="relative z-30 -mb-[34px] pl-1 text-[56px] font-extrabold lowercase leading-none tracking-tight text-black">
        {tag}
      </div>

      {/* Image frame — 2:3 portrait like the reference */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-white">
        <Image
          src={firstImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 30vw"
          className="object-contain"
        />
        {/* Hover image crossfades over the first one */}
        <Image
          src={hoverImage}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 30vw"
          className="z-20 object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
        />
        {/* Sold out badge — centred pink circle, covered on hover like the reference */}
        {product.soldOut && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="flex h-[90px] w-[90px] items-center justify-center rounded-full bg-[#F5A8B8] text-center text-[13px] font-bold uppercase leading-tight text-white">
              Sold
              <br />
              Out
            </span>
          </div>
        )}
        {product.preOrder && !product.soldOut && (
          <span className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
            Pre-order
          </span>
        )}
      </div>

      {/* Info area — text fades out on hover, add-to-cart pill fades in (same spot) */}
      <div className="relative mt-3 min-h-[120px]">
        <div className="transition-opacity duration-500 group-hover:opacity-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="max-w-[72%] text-xl font-bold uppercase leading-snug text-black">
              {product.name}
            </h3>
            <span className="whitespace-nowrap text-xl font-bold text-black">
              {product.compareAt && (
                <span className="mr-2 font-medium text-neutral-400 line-through">
                  {formatPrice(product.compareAt)}
                </span>
              )}
              {formatPrice(product.price)}
            </span>
          </div>
          <p className="mt-1 text-base text-neutral-700">Xuất xứ: Việt Nam</p>
        </div>

        <div className="absolute inset-x-[15px] bottom-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <button
            type="button"
            disabled={product.soldOut}
            onClick={handleAdd}
            className="h-[55px] w-full rounded-full bg-black text-lg font-semibold uppercase tracking-wider text-white disabled:cursor-not-allowed"
          >
            {product.soldOut ? "Sold Out" : added ? "Đã thêm ✓" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </article>
  );
}
