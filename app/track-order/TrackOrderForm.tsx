"use client";

import { useState } from "react";
import { findOrder, type Order } from "../actions/orders";
import { useLanguage } from "../lib/i18n";

const STATUS_KEYS: Record<Order["status"], string> = {
  new: "status.new",
  confirmed: "status.confirmed",
  shipping: "status.shipping",
  delivered: "status.delivered",
  cancelled: "status.cancelled",
};

function formatPrice(n: number) {
  return `${(n * 1000).toLocaleString("en-US")}₫`;
}

type Result = Awaited<ReturnType<typeof findOrder>>;

export default function TrackOrderForm() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [searched, setSearched] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await findOrder(code, phone).catch(() => ({ found: false }) as Result);
    setResult(res);
    setSearched(true);
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-2 space-y-3">
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("track.code")}
          className="h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm uppercase text-black outline-none placeholder:normal-case placeholder:text-neutral-400 focus:border-black"
        />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("track.phone")}
          inputMode="tel"
          className="h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-black text-sm font-semibold uppercase tracking-wider text-white disabled:opacity-50"
        >
          {loading ? t("track.searching") : t("track.search")}
        </button>
      </form>

      {searched && result && !result.found && (
        <p className="mt-5 rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
          {t("track.notFound")}
        </p>
      )}

      {result?.found && result.order && (
        <div className="mt-5 rounded-lg border border-neutral-200 px-5 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-lg font-black tracking-wider text-black">{result.order.code}</p>
            <p className="text-sm text-neutral-500">
              {new Date(result.order.at).toLocaleString("vi-VN")}
            </p>
          </div>
          <p className="mt-1 text-sm font-semibold text-black">
            {t("track.status")} {t(STATUS_KEYS[result.order.status])}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-neutral-600">
            {result.order.items.map((i) => (
              <li key={`${i.id}::${i.size ?? ""}::${i.color ?? ""}`} className="flex justify-between gap-4">
                <span className="uppercase">
                  {i.name}{i.size ? ` · Size ${i.size}` : ""}{i.color ? ` · ${t("cart.color", { color: i.color })}` : ""} × {i.qty}
                </span>
                <span>{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-sm font-bold text-black">
            <span>{t("track.total")}</span>
            <span>{formatPrice(result.order.total)}</span>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            {t("track.payment")} {result.order.payment === "cod" ? t("track.cod") : t("track.transfer")}
          </p>
        </div>
      )}
    </div>
  );
}
