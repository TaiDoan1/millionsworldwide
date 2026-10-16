"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "../data/products";

function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <polyline points="15 5 8 12 15 19" /> : <polyline points="9 5 16 12 9 19" />}
    </svg>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const images = product.images;
  const hasGallery = images.length > 1;
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  const save = product.compareAt ? product.compareAt - product.price : 0;
  const savePct = product.compareAt
    ? Math.round((save / product.compareAt) * 100)
    : 0;

  return (
    <div className="group flex flex-col">
      {/* Positioning context: arrows flank the image, vertically centered */}
      <div className="relative aspect-[3/4] w-full">
        <div className="absolute inset-0 overflow-hidden bg-neutral-100">
          <Image
            src={images[idx]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          {product.soldOut && (
            <span className="absolute right-0 bottom-8 bg-black px-3 py-1.5 text-xs font-medium text-white">
              sold out
            </span>
          )}
          {product.preOrder && !product.soldOut && (
            <span className="absolute right-0 bottom-8 bg-black px-3 py-1.5 text-xs font-medium text-white">
              pre-order
            </span>
          )}
          {save > 0 && !product.soldOut && (
            <span className="absolute right-0 bottom-8 bg-black px-3 py-1.5 text-xs font-medium text-white">
              save {formatPrice(save)} (-{savePct}%)
            </span>
          )}

          {/* Gallery position dots */}
          {hasGallery && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === idx ? "bg-black" : "bg-black/25"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Gallery arrows — change the image shown for THIS product */}
        {hasGallery && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-0 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 p-1 text-black transition-opacity hover:opacity-50"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="absolute right-0 top-1/2 z-20 translate-x-1/2 -translate-y-1/2 p-1 text-black transition-opacity hover:opacity-50"
            >
              <Chevron dir="right" />
            </button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-center">
        <h3 className="text-base">{product.name}</h3>
        <div className="mt-1 text-sm">
          {product.compareAt && (
            <span className="mr-2 text-neutral-400 line-through">
              {formatPrice(product.compareAt)}
            </span>
          )}
          <span>{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
}
