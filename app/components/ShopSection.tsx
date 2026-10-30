"use client";

import { useMemo, useState } from "react";
import type { Product } from "../data/products";
import ProductCard from "./ProductCard";
import CategoryChips from "../features/shop/CategoryChips";
import ShopToolbar from "../features/shop/ShopToolbar";
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  type FilterKey,
  type SortKey,
} from "../features/shop/shop-options";

/**
 * Shop grid assembly: filter + sort + layout state live here, the chips
 * row and the toolbar live in features/shop, the cards stay shared.
 */
export default function ShopSection({ products: catalog }: { products: Product[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("best-selling");
  const [sortOpen, setSortOpen] = useState(false);
  const [cols, setCols] = useState<2 | 3>(3);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const products = useMemo(() => {
    let list = [...catalog];
    if (filter !== "all") {
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
  }, [catalog, filter, sort]);

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
    <section className="w-full px-3 sm:px-[44px]">
      <CategoryChips
        filter={filter}
        onFilter={(key) => {
          setFilter(key);
          setVisibleCount(PAGE_SIZE);
        }}
      />

      <ShopToolbar
        sort={sort}
        sortLabel={sortLabel}
        sortOpen={sortOpen}
        onToggleSort={() => setSortOpen((v) => !v)}
        onCloseSort={() => setSortOpen(false)}
        onSelectSort={handleSort}
        count={products.length}
        cols={cols}
        onCols={setCols}
      />

      {/* Product grid */}
      {visible.length === 0 ? (
        <p className="py-24 text-center text-lg text-neutral-400">no products found.</p>
      ) : (
        <div
          className={`mt-5 grid auto-rows-fr grid-cols-2 gap-x-[clamp(0.5rem,3.0047vw_-_0.204225rem,3.75rem)] gap-y-[clamp(0.5rem,0.12588rem_+_1.59624vw,2.8125rem)] ${
            cols === 3 ? "min-[820px]:grid-cols-3" : ""
          }`}
        >
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} cols={cols} />
          ))}
        </div>
      )}

      {/* Load more */}
      {visibleCount < products.length && (
        <div className="mt-[clamp(1.0625rem,0.68838rem_+_1.59624vw,3.4375rem)] flex flex-col items-center gap-4">
          <p className="text-base text-[#67645e]">
            Đang hiển thị {visible.length} trong {products.length} sản phẩm
          </p>
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="h-[60px] w-[430px] max-w-full rounded-full border border-black bg-white text-[max(0.875rem,0.925vw)] uppercase text-black"
          >
            {loading ? "LOADING..." : "LOAD MORE"}
          </button>
        </div>
      )}
    </section>
  );
}
