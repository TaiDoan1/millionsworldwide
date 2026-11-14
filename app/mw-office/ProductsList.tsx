"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatPrice } from "../lib/format";
import { inputClassBase } from "./ui";
import { Pager } from "./ui-client";
import ProductEditForm from "./ProductEditForm";
import type { Product } from "../data/products";
import type { ProductCategory } from "../actions/categories";

const PAGE_SIZE = 10;

/**
 * Product rows with search + pagination. The edit form of each row
 * stays collapsed in a <details> until opened, and only the current
 * page's rows are on the page — with 17 products today the list was
 * already long, and it only grows.
 */
export default function ProductsList({
  products,
  categories,
}: {
  products: Product[];
  categories: ProductCategory[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pageProducts = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        placeholder="Tìm tên, mã hoặc danh mục…"
        className={`${inputClassBase} w-full mb-4`}
      />
      {filtered.length === 0 ? (
        <p className="text-base text-gray-500">Không có sản phẩm nào khớp.</p>
      ) : (
        <>
          <ul className="divide-y divide-neutral-100">
            {pageProducts.map((p) => (
              <li key={p.id} className="py-4">
                <div className="flex items-center gap-4">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-sm object-cover bg-neutral-100"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-sm bg-neutral-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold uppercase truncate">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(p.price)} · {p.category}
                      {p.compareAt
                        ? ` · Giá gốc ${formatPrice(p.compareAt)}`
                        : ""}
                      {p.soldOut ? " · Hết hàng" : ""}
                      {p.preOrder ? " · Đặt trước" : ""}
                      {p.hidden ? " · Đang ẩn khỏi shop" : ""}
                    </p>
                  </div>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-black w-fit">
                    Sửa
                  </summary>
                  <div className="mt-3 border border-neutral-200 p-4">
                    <ProductEditForm
                      product={p}
                      products={products}
                      categories={categories}
                    />
                  </div>
                </details>
              </li>
            ))}
          </ul>
          <Pager page={safePage} pages={pages} onPage={setPage} />
        </>
      )}
    </div>
  );
}
