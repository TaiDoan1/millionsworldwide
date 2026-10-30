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
  return (
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
        Tra cứu trạng thái đơn tại trang Theo dõi đơn hàng bằng mã đơn + Số điện thoại.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-8 h-12 rounded-full bg-black px-8 text-sm font-semibold uppercase tracking-wider text-white"
      >
        Tiếp tục mua sắm
      </button>
    </div>
  );
}
