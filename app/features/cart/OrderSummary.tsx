import { formatPrice } from "../../lib/format";

/** Subtotal / free shipping / total block under the cart lines. */
export default function OrderSummary({ subtotal }: { subtotal: number }) {
  return (
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
  );
}
