"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { placeOrder } from "../actions/orders";
import { useCart } from "./CartContext";

/** Stored prices are in thousands of VND (300 -> 300,000₫). */
function formatPrice(n: number) {
  return `${(n * 1000).toLocaleString("en-US")}₫`;
}

export default function CartDrawer() {
  const { lines, count, subtotal, isOpen, closeCart, setQty, remove, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<"cod" | "transfer">("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderCode, setOrderCode] = useState("");

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await placeOrder({
      items: lines.map((l) => ({ id: l.product.id, qty: l.qty })),
      customer: { name, phone, address, note },
      payment,
    }).catch(
      (): { success: boolean; code?: string; error?: string } => ({
        success: false,
        error: "Có lỗi xảy ra, thử lại giúp shop nhé.",
      })
    );
    setSubmitting(false);
    if (res.success && res.code) {
      setOrderCode(res.code);
      clear();
    } else {
      setError(res.error || "Không đặt được hàng, thử lại giúp shop nhé.");
    }
  };

  const close = () => {
    setOrderCode("");
    setError("");
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/40" onClick={close} aria-hidden />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <h2 className="text-lg font-bold uppercase tracking-wide text-black">
            Giỏ hàng{count > 0 && orderCode === "" ? ` (${count})` : ""}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng giỏ hàng"
            className="text-2xl leading-none text-black transition-opacity hover:opacity-60"
          >
            ×
          </button>
        </div>

        {orderCode ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="text-4xl">✓</p>
            <h3 className="mt-4 text-xl font-bold uppercase text-black">Đặt hàng thành công</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Mã đơn hàng của anh/chị là
            </p>
            <p className="mt-1 text-2xl font-black tracking-wider text-black">{orderCode}</p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Shop sẽ gọi điện xác nhận đơn và size trong giờ hỗ trợ (10:00 – 21:30).
              {payment === "transfer"
                ? " Thông tin chuyển khoản sẽ được gửi kèm khi shop xác nhận đơn."
                : " Anh/chị thanh toán khi nhận hàng nhé."}{" "}
              Tra cứu trạng thái đơn tại trang Theo dõi đơn hàng bằng mã đơn + số điện thoại.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-8 h-12 rounded-full bg-black px-8 text-sm font-semibold uppercase tracking-wider text-white"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="text-neutral-500">Giỏ hàng đang trống.</p>
            <button
              type="button"
              onClick={close}
              className="mt-6 h-12 rounded-full bg-black px-8 text-sm font-semibold uppercase tracking-wider text-white"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.map(({ product, qty }) => (
                <div key={product.id} className="flex gap-4 border-b border-neutral-100 py-4">
                  <div className="relative h-24 w-[72px] shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold uppercase leading-snug text-black">
                        {product.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        aria-label={`Xoá ${product.name}`}
                        className="text-lg leading-none text-neutral-400 hover:text-black"
                      >
                        ×
                      </button>
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-500">{formatPrice(product.price)}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-neutral-300 rounded-full">
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty - 1)}
                          className="h-8 w-8 text-black"
                          aria-label="Giảm số lượng"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-black">{qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty + 1)}
                          className="h-8 w-8 text-black"
                          aria-label="Tăng số lượng"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-bold text-black">
                        {formatPrice(product.price * qty)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-1.5 py-4 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Vận chuyển</span>
                  <span className="font-semibold text-black">Miễn phí</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-black">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="pt-1 text-xs leading-relaxed text-neutral-400">
                  Shop sẽ liên hệ xác nhận size và thông tin đơn qua điện thoại trước khi gửi hàng.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 pb-6">
                <h3 className="pt-2 text-sm font-bold uppercase tracking-wide text-black">
                  Thông tin giao hàng
                </h3>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Họ và tên *"
                  className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-black"
                />
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại *"
                  inputMode="tel"
                  className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-black"
                />
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Địa chỉ giao hàng *"
                  className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-black"
                />
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú (không bắt buộc)"
                  className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-black"
                />

                <h3 className="pt-2 text-sm font-bold uppercase tracking-wide text-black">
                  Thanh toán
                </h3>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-300 px-3 py-3 has-[:checked]:border-black">
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "cod"}
                    onChange={() => setPayment("cod")}
                    className="mt-0.5 accent-black"
                  />
                  <span className="text-sm text-black">
                    Thanh toán khi nhận hàng (COD)
                    <span className="block text-xs text-neutral-500">
                      Được kiểm hàng trước khi thanh toán.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-300 px-3 py-3 has-[:checked]:border-black">
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "transfer"}
                    onChange={() => setPayment("transfer")}
                    className="mt-0.5 accent-black"
                  />
                  <span className="text-sm text-black">
                    Chuyển khoản ngân hàng
                    <span className="block text-xs text-neutral-500">
                      Thông tin chuyển khoản được gửi khi shop xác nhận đơn.
                    </span>
                  </span>
                </label>

                {error && <p className="text-sm font-medium text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[50px] w-full rounded-full bg-black text-sm font-semibold uppercase tracking-wider text-white disabled:opacity-50"
                >
                  {submitting ? "Đang đặt hàng…" : `Đặt hàng • ${formatPrice(subtotal)}`}
                </button>
              </form>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
