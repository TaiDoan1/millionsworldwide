"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "../data/products";
import { useCart } from "./CartContext";
import ProductGallery from "../features/product/ProductGallery";
import BuyBox from "../features/product/BuyBox";
import SetPicker from "../features/product/SetPicker";
import { resolveRows } from "../features/product/piece-rows";
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
  catalog,
}: {
  product: Product;
  styleWith: Product[];
  /** Live catalog, so linked "món lẻ" resolve to their products. */
  catalog: Product[];
}) {
  const [selected, setSelected] = useState(0);
  const [added, setAdded] = useState(false);
  const { add, openCart } = useCart();

  // Gallery photos follow the set picker's selection: a single linked
  // piece shows that piece's photos, anything else shows the set's.
  const [galleryImages, setGalleryImages] = useState(product.images);
  const handleGalleryImages = (imgs: string[]) => {
    setGalleryImages(imgs);
    setSelected(0);
  };

  const images = galleryImages;
  const count = images.length;
  const prev = () => setSelected((s) => (s - 1 + count) % count);
  const next = () => setSelected((s) => (s + 1) % count);

  const handleAdd = (size?: string) => {
    add(product.id, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
    openCart();
  };

  // A set with linked pieces sells through the Shopee-style picker
  // (choose 1 piece or the full set); anything else uses the plain
  // buy box. The old separate "Mua lẻ từng món" list is gone.
  const hasPieces = resolveRows(product, catalog).length > 0;

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
          {hasPieces ? (
            <SetPicker
              product={product}
              catalog={catalog}
              onGalleryImages={handleGalleryImages}
            />
          ) : (
            <BuyBox product={product} added={added} onAdd={handleAdd} />
          )}
          <ProductAccordions product={product} />
        </div>
      </div>

      <RelatedProducts products={styleWith} name={product.name} />
    </div>
  );
}
