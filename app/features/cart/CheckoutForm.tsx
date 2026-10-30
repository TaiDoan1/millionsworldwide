import { formatPrice } from "../../lib/format";

export type CheckoutFormValues = {
  name: string;
  phone: string;
  address: string;
  note: string;
};

/** Delivery info + payment choice + submit. Field state lives in the drawer. */
export default function CheckoutForm({
  values,
  onChange,
  payment,
  onPaymentChange,
  submitting,
  error,
  subtotal,
  onSubmit,
}: {
  values: CheckoutFormValues;
  onChange: (field: keyof CheckoutFormValues, value: string) => void;
  payment: "cod" | "transfer";
  onPaymentChange: (payment: "cod" | "transfer") => void;
  submitting: boolean;
  error: string;
  subtotal: number;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const inputClass =
    "h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-black";
  return (
    <form onSubmit={onSubmit} className="space-y-3 pb-6">
      <h3 className="pt-2 text-sm font-bold uppercase tracking-wide text-black">
        Thông tin giao hàng
      </h3>
      <input
        required
        value={values.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="Họ và tên *"
        className={inputClass}
      />
      <input
        required
        value={values.phone}
        onChange={(e) => onChange("phone", e.target.value)}
        placeholder="Số điện thoại *"
        inputMode="tel"
        className={inputClass}
      />
      <input
        required
        value={values.address}
        onChange={(e) => onChange("address", e.target.value)}
        placeholder="Địa chỉ giao hàng *"
        className={inputClass}
      />
      <input
        value={values.note}
        onChange={(e) => onChange("note", e.target.value)}
        placeholder="Ghi chú (không bắt buộc)"
        className={inputClass}
      />

      <h3 className="pt-2 text-sm font-bold uppercase tracking-wide text-black">
        Thanh toán
      </h3>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-300 px-3 py-3 has-[:checked]:border-black">
        <input
          type="radio"
          name="payment"
          checked={payment === "cod"}
          onChange={() => onPaymentChange("cod")}
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
          onChange={() => onPaymentChange("transfer")}
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
  );
}
