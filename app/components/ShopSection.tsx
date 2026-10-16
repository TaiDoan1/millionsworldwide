"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS, type Category } from "../data/products";
import ProductCard from "./ProductCard";

export default function ShopSection() {
  const [category, setCategory] = useState<Category>("t-shirts");
  const [hideSoldOut, setHideSoldOut] = useState(false);

  const products = useMemo(
    () =>
      PRODUCTS.filter(
        (p) => p.category === category && (!hideSoldOut || !p.soldOut)
      ),
    [category, hideSoldOut]
  );

  return (
    <section className="mx-auto w-full max-w-[1400px] px-6">
      {/* Hide sold out toggle */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <span className="text-lg">hide sold out items</span>
        <button
          role="switch"
          aria-checked={hideSoldOut}
          aria-label="Hide sold out items"
          onClick={() => setHideSoldOut((v) => !v)}
          className={`relative h-7 w-14 rounded-full border border-neutral-300 transition-colors ${
            hideSoldOut ? "bg-black" : "bg-neutral-200"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              hideSoldOut ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Heading */}
      <h2 className="mt-20 text-5xl font-bold tracking-tight sm:text-6xl">all products</h2>

      {/* Category tabs */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`min-w-[120px] border border-black px-6 py-3 text-base transition-colors ${
              category === cat ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid — one row of 3 on desktop */}
      <div className="mt-14 px-6">
        {products.length === 0 ? (
          <p className="py-20 text-center text-neutral-400">no products found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
