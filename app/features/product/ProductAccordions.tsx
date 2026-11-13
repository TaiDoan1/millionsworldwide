import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Product } from "../../data/products";
import { useLanguage } from "../../lib/i18n";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_DESCRIPTION_EN,
  DESCRIPTION_BY_CATEGORY,
  DESCRIPTION_BY_CATEGORY_EN,
  EASE,
} from "./constants";

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
  const { lang, t } = useLanguage();
  const description =
    lang === "en"
      ? (DESCRIPTION_BY_CATEGORY_EN[product.category] ?? DEFAULT_DESCRIPTION_EN)
      : (DESCRIPTION_BY_CATEGORY[product.category] ?? DEFAULT_DESCRIPTION);

  return (
    <div className="mt-8 border-t border-neutral-200">
      <Accordion title={t("acc.desc")} open={openSection === 0} onToggle={() => toggle(0)}>
        <p>{description}</p>
      </Accordion>
      <Accordion title={t("acc.sizeFit")} open={openSection === 1} onToggle={() => toggle(1)}>
        {product.sizeChart ? (
          /* Plain img on purpose: the chart is served by the /uploads
             route, outside next/image's local set. */
          <img
            src={product.sizeChart}
            alt={`Bảng size của ${product.name}`}
            className="w-full rounded-[12px] border border-neutral-200"
          />
        ) : (
          <p>{t("acc.noSizeChart")}</p>
        )}
      </Accordion>
      <Accordion
        title={t("acc.shipping")}
        open={openSection === 2}
        onToggle={() => toggle(2)}
      >
        <p>
          {t("acc.shippingText")}{" "}
          <Link href="/shipping" className="underline">
            {t("acc.shippingLink")}
          </Link>{" "}
          •{" "}
          <Link href="/refund-policy" className="underline">
            {t("acc.returnLink")}
          </Link>
        </p>
      </Accordion>
      <Accordion title={t("acc.help")} open={openSection === 3} onToggle={() => toggle(3)}>
        <p>
          <Link href="/contact" className="underline">
            {t("acc.contactShop")}
          </Link>{" "}
          •{" "}
          <Link href="/faq" className="underline">
            {t("acc.faq")}
          </Link>{" "}
          •{" "}
          <Link href="/track-order" className="underline">
            {t("acc.trackOrder")}
          </Link>
        </p>
      </Accordion>
    </div>
  );
}
