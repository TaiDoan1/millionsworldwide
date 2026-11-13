import { useLanguage } from "../../lib/i18n";

/** Order confirmation shown inside the drawer after a successful order. */
export default function OrderSuccess({
  orderCode,
  payment,
  onClose,
}: {
  orderCode: string;
  payment: "cod" | "transfer";
  onClose: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <p className="text-4xl">✓</p>
      <h3 className="mt-4 text-xl font-bold uppercase text-black">{t("success.title")}</h3>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {t("success.code")}
      </p>
      <p className="mt-1 text-2xl font-black tracking-wider text-black">{orderCode}</p>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        {t("success.text")}
        {payment === "transfer"
          ? t("success.transfer")
          : t("success.cod")}{" "}
        {t("success.track")}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-8 h-12 rounded-full bg-black px-8 text-sm font-semibold uppercase tracking-wider text-white"
      >
        {t("cart.continue")}
      </button>
    </div>
  );
}
