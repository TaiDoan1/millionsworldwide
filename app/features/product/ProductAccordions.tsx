import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Product } from "../../data/products";
import { DESCRIPTION_BY_CATEGORY, EASE } from "./constants";

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

/** The four detail accordions. Owns its open-section state (first open). */
export default function ProductAccordions({ product }: { product: Product }) {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const toggle = (i: number) =>
    setOpenSection(openSection === i ? null : i);

  return (
    <div className="mt-8 border-t border-neutral-200">
      <Accordion title="Mô tả" open={openSection === 0} onToggle={() => toggle(0)}>
        <p>{DESCRIPTION_BY_CATEGORY[product.category]}</p>
      </Accordion>
      <Accordion title="Size & Fit" open={openSection === 1} onToggle={() => toggle(1)}>
        <p>
          Web hiện chưa bán theo bảng size cố định trên từng sản phẩm.
          Khi gọi xác nhận đơn, shop sẽ xác nhận size với bạn trước khi
          giao hàng.
        </p>
      </Accordion>
      <Accordion
        title="Giao hàng & Đổi trả"
        open={openSection === 2}
        onToggle={() => toggle(2)}
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
      <Accordion title="Cần hỗ trợ?" open={openSection === 3} onToggle={() => toggle(3)}>
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
  );
}
