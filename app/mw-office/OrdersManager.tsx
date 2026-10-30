"use client";

import { useMemo, useState } from "react";
import OrderStatusControl from "./OrderStatusControl";
import CsvButton from "./CsvButton";
import { csvRow } from "../lib/csv";
import { formatPrice } from "../lib/format";
import type { Order } from "../actions/orders";

const STATUS_LABELS: Record<Order["status"], string> = {
  new: "Mới đặt",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
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
        o.customer.name,
        o.customer.phone,
        o.customer.address,
        o.payment === "cod" ? "COD" : "Chuyển khoản",
        STATUS_LABELS[o.status],
        o.total,
        o.items
          .map((i) => `${i.name}${i.size ? ` (Size ${i.size})` : ""} x${i.qty}`)
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
          className="flex-1 min-w-[220px] border border-gray-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-black"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | Order["status"])}
          className="border border-gray-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-black bg-white"
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
        <p className="text-sm text-gray-400">Không có đơn nào khớp.</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((o) => (
            <div key={o.code} className="border border-neutral-200 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-black tracking-wider">{o.code}</p>
                <p className="text-xs text-gray-500">
                  {new Date(o.at).toLocaleString("vi-VN")}
                </p>
              </div>
              <p className="mt-1 text-sm">
                {o.customer.name} — {o.customer.phone}
                <span className="text-gray-500"> · {o.customer.address}</span>
              </p>
              {o.customer.note && (
                <p className="text-sm text-gray-500">Ghi chú: {o.customer.note}</p>
              )}
              <ul className="mt-2 text-sm text-gray-700">
                {o.items.map((i) => (
                  <li
                    key={`${i.id}::${i.size ?? ""}`}
                    className="flex justify-between"
                  >
                    <span className="uppercase">
                      {i.name}
                      {i.size ? ` · Size ${i.size}` : ""} × {i.qty}
                    </span>
                    <span>{formatPrice(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 text-sm font-bold">
                <span>
                  Tổng · {o.payment === "cod" ? "COD" : "Chuyển khoản"} ·{" "}
                  {STATUS_LABELS[o.status]}
                </span>
                <span>{formatPrice(o.total)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-500">Đổi trạng thái:</span>
                <OrderStatusControl code={o.code} status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
