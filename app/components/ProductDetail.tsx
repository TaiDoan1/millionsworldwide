"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "../data/products";
import { useCart } from "./CartContext";
import ProductGallery from "../features/product/ProductGallery";
import BuyBox from "../features/product/BuyBox";
import ProductAccordions from "../features/product/ProductAccordions";
import RelatedProducts from "../features/product/RelatedProducts";

/**
 * Product detail assembly: breadcrumb + gallery + buy column + cross-sell.
 * The sections live in features/product; this file only holds the shared
 * state (selected photo, just-added feedback) and the page layout.
 */
export default function ProductDetail({
  product,
  styleWith,
}: {
  product: Product;
  styleWith: Product[];
}) {
  const [selected, setSelected] = useState(0);
  const [added, setAdded] = useState(false);
  const { add, openCart } = useCart();

  const images = product.images;
  const count = images.length;
  const prev = () => setSelected((s) => (s - 1 + count) % count);
  const next = () => setSelected((s) => (s + 1) % count);

  const handleAdd = () => {
    add(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
    openCart();
  };

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="mw-fade-up px-4 sm:px-0">
        <Link
          href="/trangchu"
          className="text-sm text-[#67645e] transition-colors hover:text-black"
        >
          ← Quay lại cửa hàng
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-8 px-4 sm:px-0 lg:flex-row lg:gap-12">
        {/* Gallery — left column */}
        <div
          className="mw-fade-up w-full lg:w-[55%]"
          style={{ animationDelay: "80ms" }}
        >
          <ProductGallery
            images={images}
            name={product.name}
            soldOut={product.soldOut}
            selected={selected}
            onSelect={setSelected}
            onPrev={prev}
            onNext={next}
          />
        </div>

        {/* Buy column — sticky on desktop, like the reference detail page. */}
        <div
          className="mw-fade-up w-full lg:sticky lg:top-[110px] lg:w-[45%] lg:self-start"
          style={{ animationDelay: "160ms" }}
        >
          <BuyBox product={product} added={added} onAdd={handleAdd} />
          <ProductAccordions product={product} />
        </div>
      </div>

      <RelatedProducts products={styleWith} name={product.name} />
    </div>
  );
}
