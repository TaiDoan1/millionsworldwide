"use client";

import { useEffect, useState } from "react";
import { placeOrder } from "../actions/orders";
import { useCart } from "./CartContext";
import CartLines from "../features/cart/CartLines";
import OrderSummary from "../features/cart/OrderSummary";
import CheckoutForm, { type CheckoutFormValues } from "../features/cart/CheckoutForm";
import OrderSuccess from "../features/cart/OrderSuccess";

const EMPTY_FORM: CheckoutFormValues = {
  name: "",
  phone: "",
  address: "",
  note: "",
};

/**
 * Cart drawer shell: header + scroll lock + submit flow. The rows, the
 * summary, the checkout form and the success screen each live in
 * features/cart so this file stays thin.
 */
export default function CartDrawer() {
  const { lines, count, subtotal, isOpen, closeCart, setQty, remove, clear } = useCart();
  const [form, setForm] = useState<CheckoutFormValues>(EMPTY_FORM);
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
      customer: { ...form },
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

  const setField = (field: keyof CheckoutFormValues, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

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
          <OrderSuccess orderCode={orderCode} payment={payment} onClose={close} />
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
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <CartLines lines={lines} onQty={setQty} onRemove={remove} />
            <OrderSummary subtotal={subtotal} />
            <CheckoutForm
              values={form}
              onChange={setField}
              payment={payment}
              onPaymentChange={setPayment}
              submitting={submitting}
              error={error}
              subtotal={subtotal}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </aside>
    </div>
  );
}
