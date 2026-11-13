import { formatPrice } from "../../lib/format";
import { useLanguage } from "../../lib/i18n";

/** Subtotal / free shipping / total block under the cart lines. */
export default function OrderSummary({ subtotal }: { subtotal: number }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-1.5 py-4 text-sm">
      <div className="flex justify-between text-neutral-600">
        <span>{t("summary.subtotal")}</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-neutral-600">
        <span>{t("summary.shipping")}</span>
        <span className="font-semibold text-black">{t("summary.free")}</span>
      </div>
      <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-black">
        <span>{t("summary.total")}</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <p className="pt-1 text-xs leading-relaxed text-neutral-400">
        {t("summary.note")}
      </p>
    </div>
  );
}
