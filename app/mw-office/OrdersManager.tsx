"use client";

import { useMemo, useState } from "react";
import OrderStatusControl from "./OrderStatusControl";
import CsvButton from "./CsvButton";
import { csvRow } from "../lib/csv";
import { formatPrice } from "../lib/format";
import { inputClassBase } from "./ui";
import type { Order } from "../actions/orders";

const STATUS_LABELS: Record<Order["status"], string> = {
  new: "Mới đặt",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const PAYMENT_LABELS: Record<Order["payment"], string> = {
  cod: "COD",
  transfer: "Chuyển khoản",
  cash: "Tiền mặt",
};

const STATUSES = Object.keys(STATUS_LABELS) as Order["status"][];

/** Order list with search, status filter and CSV export (filtered rows). */
export default function OrdersManager({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Order["status"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!q) return true;
      return (
        o.code.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      );
    });
  }, [orders, query, status]);

  const csv = useMemo(() => {
    let out = csvRow([
      "Mã đơn",
      "Ngày",
      "Kênh",
      "Khách",
      "SĐT",
      "Địa chỉ",
      "Thanh toán",
      "Trạng thái",
      "Tổng (nghìn đồng)",
      "Sản phẩm",
    ]);
    for (const o of filtered) {
      out += csvRow([
        o.code,
        new Date(o.at).toLocaleString("vi-VN"),
        o.channel === "in-store" ? "Tại quầy" : "Online",
        o.customer.name,
        o.customer.phone,
        o.customer.address,
        PAYMENT_LABELS[o.payment],
        STATUS_LABELS[o.status],
        o.total,
        o.items
          .map(
            (i) =>
              `${i.name}${i.size ? ` (Size ${i.size})` : ""}${i.color ? ` (Màu ${i.color})` : ""} x${i.qty}`,
          )
          .join("; "),
      ]);
    }
    return out;
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm mã đơn, tên, số điện thoại…"
          className={`${inputClassBase} flex-1 min-w-[220px]`}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | Order["status"])}
          className={`${inputClassBase} bg-white`}
        >
          <option value="all">Tất cả trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <CsvButton
          filename="millions-don-hang.csv"
          csv={csv}
          label={`Xuất CSV (${filtered.length})`}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-base text-gray-500">Không có đơn nào khớp.</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((o) => (
            <div key={o.code} className="border border-neutral-200 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-base font-black tracking-wider">
                  {o.code}
                  {o.channel === "in-store" && (
                    <span className="ml-2 bg-black px-2 py-0.5 align-middle text-xs font-bold uppercase tracking-wider text-white">
                      Tại quầy
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(o.at).toLocaleString("vi-VN")}
                </p>
              </div>
              <p className="mt-1 text-base">
                {o.customer.name}
                {o.customer.phone && (
                  <>
                    {" — "}
                    {o.customer.phone}
                  </>
                )}
                {o.customer.address && (
                  <span className="text-gray-600"> · {o.customer.address}</span>
                )}
              </p>
              {o.customer.note && (
                <p className="text-base text-gray-600">Ghi chú: {o.customer.note}</p>
              )}
              <ul className="mt-2 text-base text-gray-800">
                {o.items.map((i) => (
                  <li
                    key={`${i.id}::${i.size ?? ""}::${i.color ?? ""}`}
                    className="flex justify-between"
                  >
                    <span className="uppercase">
                      {i.name}
                      {i.size ? ` · Size ${i.size}` : ""}
                      {i.color ? ` · Màu ${i.color}` : ""} × {i.qty}
                    </span>
                    <span>{formatPrice(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 text-base font-bold">
                <span>
                  Tổng · {PAYMENT_LABELS[o.payment]} ·{" "}
                  {STATUS_LABELS[o.status]}
                </span>
                <span>{formatPrice(o.total)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-base">
                <span className="text-gray-600">Đổi trạng thái:</span>
                <OrderStatusControl code={o.code} status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
