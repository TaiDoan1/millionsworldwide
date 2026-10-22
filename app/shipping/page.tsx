import PolicyPage from "../components/PolicyPage";

export const metadata = { title: "chính sách vận chuyển — millions worldwide™" };

export default function ShippingPage() {
  return (
    <PolicyPage title="Chính sách vận chuyển">
      <h2>Phạm vi và phí vận chuyển</h2>
      <ul>
        <li>Giao hàng toàn quốc (Việt Nam).</li>
        <li><strong>Miễn phí vận chuyển</strong> cho mọi đơn hàng.</li>
        <li>Đơn quốc tế: vui lòng liên hệ shop qua trang <a href="/contact">Liên hệ</a> để được hỗ trợ riêng.</li>
      </ul>
      <h2>Thời gian giao hàng</h2>
      <ul>
        <li>Thời gian xử lý đơn: 1–2 ngày làm việc sau khi đơn được xác nhận.</li>
        <li>Thời gian giao hàng dự kiến: 3–5 ngày làm việc tùy khu vực.</li>
        <li>Sản phẩm pre-order: thời gian giao sẽ được thông báo cụ thể khi xác nhận đơn.</li>
      </ul>
      <h2>Theo dõi đơn hàng</h2>
      <p>
        Kiểm tra trạng thái đơn tại trang <a href="/track-order">Theo dõi đơn hàng</a>{" "}
        bằng mã đơn và số điện thoại đặt hàng.
      </p>
    </PolicyPage>
  );
}
