"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Product } from "../data/products";
import { useCart } from "./CartContext";
import ProductCard, { formatPrice } from "./ProductCard";

/** The reference site's signature motion: 0.7s cubic-bezier(0.76, 0, 0.24, 1). */
const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

const TAG_BY_CATEGORY: Record<Product["category"], string> = {
  sets: "set",
  "t-shirts": "t-shirt",
  shirts: "shirt",
  jeans: "jeans",
  shorts: "shorts",
};

const DESCRIPTION_BY_CATEGORY: Record<Product["category"], string> = {
  sets: "Set phối sẵn gồm áo và quần — mặc nguyên bộ là đủ outfit. Ảnh sản phẩm chụp từ bộ lookbook của Millions.",
  "t-shirts":
    "Áo thun trong bộ lookbook của Millions. Ảnh sản phẩm là ảnh thật từ buổi chụp của shop.",
  shirts:
    "Áo sơ mi / khoác trong bộ lookbook của Millions. Ảnh sản phẩm là ảnh thật từ buổi chụp của shop.",
  jeans:
    "Quần jeans ống rộng trong bộ lookbook của Millions. Ảnh sản phẩm là ảnh thật từ buổi chụp của shop.",
  shorts:
    "Quần shorts trong bộ lookbook của Millions. Ảnh sản phẩm là ảnh thật từ buổi chụp của shop.",
};

function Accordion({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-neutral-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold uppercase tracking-wider"
      >
        {title}
        <span
          className={`text-xl font-light leading-none transition-transform duration-700 ${EASE} ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-700 ${EASE} ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-5 text-sm leading-relaxed text-[#67645e]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail({
  product,
  styleWith,
}: {
  product: Product;
  styleWith: Product[];
}) {
  const [selected, setSelected] = useState(0);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(0);
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
        {/* Gallery — left column. Photos stack and crossfade on switch. */}
        <div
          className="mw-fade-up w-full lg:w-[55%]"
          style={{ animationDelay: "80ms" }}
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[12px] bg-[#f5f5f5]">
            {images.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={i === selected ? product.name : ""}
                aria-hidden={i !== selected}
                fill
                priority={i === 0}
                sizes="(max-width: 1023px) 100vw, 55vw"
                className={`object-cover transition-opacity duration-700 ${EASE} ${
                  i === selected ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            {product.soldOut && (
              <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
                <span className="flex h-[85px] w-[85px] items-center justify-center rounded-full border-[1.5px] border-[#d46b78] bg-[#f0a0a9] text-center text-xs font-semibold uppercase leading-tight tracking-[1.5px] text-white">
                  Sold
                  <br />
                  Out
                </span>
              </div>
            )}
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Ảnh trước"
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow transition hover:bg-white"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Ảnh sau"
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow transition hover:bg-white"
                >
                  →
                </button>
                <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                  {selected + 1} / {count}
                </span>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {count > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-label={`Xem ảnh ${i + 1}`}
                  className={`relative aspect-[2/3] w-[72px] shrink-0 overflow-hidden rounded-[8px] bg-[#f5f5f5] transition-all duration-700 ${EASE} ${
                    i === selected
                      ? "ring-2 ring-black ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    aria-hidden
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy column — sticky on desktop, like the reference detail page. */}
        <div
          className="mw-fade-up w-full lg:sticky lg:top-[110px] lg:w-[45%] lg:self-start"
          style={{ animationDelay: "160ms" }}
        >
          <span className="text-sm font-bold lowercase text-black">
            {TAG_BY_CATEGORY[product.category]}
          </span>
          <h1 className="mt-2 text-3xl font-bold uppercase leading-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-xl font-bold">
            {product.compareAt && (
              <span className="mr-2 font-medium text-neutral-400 line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
            {formatPrice(product.price)}
          </p>
          {product.preOrder && (
            <p className="mt-2 inline-block bg-[#666] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Pre-order
            </p>
          )}

          {/* Size note — the shop confirms size by phone, so no size
              picker is invented here; the note keeps the flow honest. */}
          <div className="mt-6 rounded-[12px] bg-[#f5f5f5] p-4">
            <p className="text-sm font-semibold uppercase tracking-wider">
              Size
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#67645e]">
              Shop sẽ xác nhận size khi gọi xác nhận đơn. Bạn có thể ghi chú
              size mình mặc ở bước đặt hàng.
            </p>
          </div>

          <button
            type="button"
            disabled={product.soldOut}
            onClick={handleAdd}
            className={`mt-6 h-[50px] w-full rounded-full bg-black text-[max(0.875rem,0.925vw)] uppercase text-white transition-opacity duration-700 ${EASE} hover:opacity-80 disabled:cursor-not-allowed disabled:bg-neutral-400`}
          >
            {product.soldOut ? "Sold Out" : added ? "Đã thêm ✓" : "Thêm vào giỏ"}
          </button>
          <p className="mt-3 text-center text-sm text-[#67645e]">
            Miễn phí vận chuyển toàn quốc • Shop xử lý đơn trong 1–2 ngày,
            giao hàng trong 3–5 ngày.
          </p>

          {/* Accordions */}
          <div className="mt-8 border-t border-neutral-200">
            <Accordion
              title="Mô tả"
              open={openSection === 0}
              onToggle={() => setOpenSection(openSection === 0 ? null : 0)}
            >
              <p>{DESCRIPTION_BY_CATEGORY[product.category]}</p>
            </Accordion>
            <Accordion
              title="Size & Fit"
              open={openSection === 1}
              onToggle={() => setOpenSection(openSection === 1 ? null : 1)}
            >
              <p>
                Web hiện chưa bán theo bảng size cố định trên từng sản phẩm.
                Khi gọi xác nhận đơn, shop sẽ xác nhận size với bạn trước khi
                giao hàng.
              </p>
            </Accordion>
            <Accordion
              title="Giao hàng & Đổi trả"
              open={openSection === 2}
              onToggle={() => setOpenSection(openSection === 2 ? null : 2)}
            >
              <p>
                Miễn phí vận chuyển toàn quốc. Shop xử lý đơn trong 1–2 ngày,
                giao hàng trong 3–5 ngày. Đổi trả trong 14 ngày với sản phẩm
                chưa mặc, chưa giặt, còn tag.{" "}
                <Link href="/shipping" className="underline">
                  Chính sách giao hàng
                </Link>{" "}
                •{" "}
                <Link href="/refund-policy" className="underline">
                  Chính sách đổi trả
                </Link>
              </p>
            </Accordion>
            <Accordion
              title="Cần hỗ trợ?"
              open={openSection === 3}
              onToggle={() => setOpenSection(openSection === 3 ? null : 3)}
            >
              <p>
                <Link href="/contact" className="underline">
                  Liên hệ shop
                </Link>{" "}
                •{" "}
                <Link href="/faq" className="underline">
                  Câu hỏi thường gặp
                </Link>{" "}
                •{" "}
                <Link href="/track-order" className="underline">
                  Theo dõi đơn hàng
                </Link>
              </p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Style with — cross-sell block, same cards as the shop grid. */}
      {styleWith.length > 0 && (
        <section
          className="mw-fade-up mt-16 px-4 sm:px-0"
          style={{ animationDelay: "240ms" }}
        >
          <h2 className="text-2xl font-bold uppercase">Phối cùng</h2>
          <p className="mt-1 text-sm text-[#67645e]">
            Gợi ý mặc cùng {product.name}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {styleWith.map((p) => (
              <ProductCard key={p.id} product={p} cols={2} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
