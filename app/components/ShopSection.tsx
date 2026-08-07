"use client";

import { useMemo, useRef, useState } from "react";
import { CATEGORIES, PRODUCTS, type Category } from "../data/products";
import ProductCard from "./ProductCard";

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <polyline points="15 5 8 12 15 19" /> : <polyline points="9 5 16 12 9 19" />}
    </svg>
  );
}

export default function ShopSection() {
  const [category, setCategory] = useState<Category>("t-shirts");
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const products = useMemo(
    () =>
      PRODUCTS.filter(
        (p) => p.category === category && (!hideSoldOut || !p.soldOut)
      ),
    [category, hideSoldOut]
  );

  function scroll(dir: "left" | "right") {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 32 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

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

      {/* Carousel */}
      <div className="relative mt-14">
        <button
          aria-label="Previous"
          onClick={() => scroll("left")}
          className="absolute -left-2 top-[38%] z-10 -translate-y-1/2 bg-white/80 p-1 transition-opacity hover:opacity-60 sm:-left-4"
        >
          <Arrow dir="left" />
        </button>
        <button
          aria-label="Next"
          onClick={() => scroll("right")}
          className="absolute -right-2 top-[38%] z-10 -translate-y-1/2 bg-white/80 p-1 transition-opacity hover:opacity-60 sm:-right-4"
        >
          <Arrow dir="right" />
        </button>

        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth px-6"
        >
          {products.length === 0 && (
            <p className="w-full py-20 text-center text-neutral-400">no products found.</p>
          )}
          {products.map((p) => (
            <div
              key={p.id}
              data-card
              className="w-[calc(100%-2rem)] shrink-0 snap-start sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
