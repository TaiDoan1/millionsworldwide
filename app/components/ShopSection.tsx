"use client";

import { useMemo, useState } from "react";
import { PRODUCTS, type Category } from "../data/products";
import ProductCard from "./ProductCard";

type FilterKey = "all" | "best" | Category;

const CHIPS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "ALL PRODUCTS" },
  { key: "best", label: "BEST SELLER" },
  { key: "t-shirts", label: "T-SHIRTS" },
  { key: "sneakers", label: "SNEAKERS" },
  { key: "sweatpants", label: "SWEATPANTS" },
];

type SortKey =
  | "best-selling"
  | "name-a-z"
  | "name-z-a"
  | "price-low-high"
  | "price-high-low"
  | "newest"
  | "oldest";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "best-selling", label: "best selling" },
  { key: "name-a-z", label: "name a-z" },
  { key: "name-z-a", label: "name z-a" },
  { key: "price-low-high", label: "price low to high" },
  { key: "price-high-low", label: "price high to low" },
  { key: "newest", label: "newest first" },
  { key: "oldest", label: "oldest first" },
];

const PAGE_SIZE = 12;

function GridIcon({ cols, active }: { cols: 2 | 3; active: boolean }) {
  const cells = cols === 2 ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <span
      className={`grid gap-[3px] ${cols === 2 ? "grid-cols-2" : "grid-cols-3"} ${
        active ? "opacity-100" : "opacity-30"
      }`}
    >
      {cells.map((c) => (
        <span key={c} className="h-[7px] w-[7px] bg-black" />
      ))}
    </span>
  );
}

export default function ShopSection() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("best-selling");
  const [sortOpen, setSortOpen] = useState(false);
  const [cols, setCols] = useState<2 | 3>(3);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const products = useMemo(() => {
    let list = [...PRODUCTS];
    if (filter === "best") {
      list = list.filter((p) => p.compareAt || p.preOrder);
    } else if (filter !== "all") {
      list = list.filter((p) => p.category === filter);
    }
    switch (sort) {
      case "name-a-z":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-z-a":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-low-high":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.reverse();
        break;
      default:
        break;
    }
    return list;
  }, [filter, sort]);

  const visible = products.slice(0, visibleCount);
  const sortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label;

  const handleSort = (key: SortKey) => {
    setSort(key);
    setSortOpen(false);
    // Reference behaviour: changing sort resets the grid to 3 columns
    setCols(3);
    setVisibleCount(PAGE_SIZE);
  };

  const handleLoadMore = () => {
    setLoading(true);
    window.setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoading(false);
    }, 700);
  };

  return (
    <section className="w-full px-10">
      {/* Category chips */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => {
              setFilter(chip.key);
              setVisibleCount(PAGE_SIZE);
            }}
            className={`h-[58px] rounded-full border border-black px-7 text-xl font-medium uppercase transition-colors duration-300 ${
              filter === chip.key
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-black hover:text-white"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Sort + layout bar */}
      <div className="relative mt-14 flex items-center justify-between">
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="text-lg text-black"
          >
            Sort: <span className="underline underline-offset-4">{sortLabel}</span>{" "}
            <span aria-hidden>▾</span>
          </button>
          {sortOpen && (
            <div className="absolute left-0 top-full z-40 mt-3 w-[380px] max-w-[80vw] rounded-2xl bg-[#FAF8F0] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.15)]">
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Sort by
                </span>
                <button
                  type="button"
                  aria-label="Close sort"
                  onClick={() => setSortOpen(false)}
                  className="text-xl leading-none text-black"
                >
                  –
                </button>
              </div>
              <ul className="max-h-[300px] overflow-y-auto">
                {SORT_OPTIONS.map((o) => (
                  <li key={o.key}>
                    <button
                      type="button"
                      onClick={() => handleSort(o.key)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-lg lowercase transition-colors hover:bg-black/5 ${
                        sort === o.key ? "font-bold" : ""
                      }`}
                    >
                      {o.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          <span className="text-lg text-black">{products.length} products</span>
          <button
            type="button"
            aria-label="2 column layout"
            onClick={() => setCols(2)}
          >
            <GridIcon cols={2} active={cols === 2} />
          </button>
          <button
            type="button"
            aria-label="3 column layout"
            onClick={() => setCols(3)}
          >
            <GridIcon cols={3} active={cols === 3} />
          </button>
        </div>
      </div>

      {/* Product grid */}
      {visible.length === 0 ? (
        <p className="py-24 text-center text-lg text-neutral-400">no products found.</p>
      ) : (
        <div
          className={`mt-6 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 ${
            cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Load more */}
      {visibleCount < products.length && (
        <div className="mt-[60px] flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="h-[60px] w-[430px] max-w-full rounded-full border border-black bg-white text-lg uppercase tracking-[0.2em] text-black"
          >
            {loading ? "LOADING..." : "LOAD MORE"}
          </button>
        </div>
      )}
    </section>
  );
}
