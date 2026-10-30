"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, type Order } from "../actions/orders";

const STATUS_LABELS: Record<Order["status"], string> = {
  new: "Mới đặt",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const STATUSES = Object.keys(STATUS_LABELS) as Order["status"][];

/** Per-order status dropdown on the admin page (admin only, server-checked). */
export default function OrderStatusControl({
  code,
  status,
}: {
  code: string;
  status: Order["status"];
}) {
  const router = useRouter();
  const [value, setValue] = useState<Order["status"]>(status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleChange(next: Order["status"]) {
    setValue(next);
    setSaving(true);
    setMessage("");
    const result = await updateOrderStatus(code, next);
    setSaving(false);
    if (result.success) {
      setMessage("Đã lưu.");
      router.refresh();
    } else {
      setMessage(result.error ?? "Không lưu được.");
      setValue(status);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <select
        aria-label={`Trạng thái đơn ${code}`}
        value={value}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as Order["status"])}
        className="border border-neutral-300 bg-white px-2 py-1.5 text-xs font-medium disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <span className="text-xs text-gray-500">
        {saving ? "Đang lưu…" : message}
      </span>
    </span>
  );
}
