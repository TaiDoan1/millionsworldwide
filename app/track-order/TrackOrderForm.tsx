"use client";

import { useState } from "react";
import { findOrder, type Order } from "../actions/orders";

const STATUS_LABELS: Record<Order["status"], string> = {
  new: "Mới đặt — chờ shop xác nhận",
  confirmed: "Đã xác nhận — đang chuẩn bị hàng",
  shipping: "Đang giao hàng",
  delivered: "Đã giao thành công",
  cancelled: "Đã hủy",
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
          placeholder="Mã đơn hàng (vd: MW-ABC12345)"
          className="h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm uppercase text-black outline-none placeholder:normal-case placeholder:text-neutral-400 focus:border-black"
        />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Số điện thoại đặt hàng"
          inputMode="tel"
          className="h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-black text-sm font-semibold uppercase tracking-wider text-white disabled:opacity-50"
        >
          {loading ? "Đang tra cứu…" : "Tra cứu đơn hàng"}
        </button>
      </form>

      {searched && result && !result.found && (
        <p className="mt-5 rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
          Không tìm thấy đơn hàng. Anh/chị kiểm tra lại mã đơn và số điện thoại, hoặc
          liên hệ shop qua trang Liên hệ để được hỗ trợ.
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
            Trạng thái: {STATUS_LABELS[result.order.status]}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-neutral-600">
            {result.order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4">
                <span className="uppercase">
                  {i.name} × {i.qty}
                </span>
                <span>{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-sm font-bold text-black">
            <span>Tổng cộng</span>
            <span>{formatPrice(result.order.total)}</span>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Thanh toán: {result.order.payment === "cod" ? "Khi nhận hàng (COD)" : "Chuyển khoản"}
          </p>
        </div>
      )}
    </div>
  );
}
