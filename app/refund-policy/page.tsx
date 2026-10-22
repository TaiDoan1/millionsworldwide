import PolicyPage from "../components/PolicyPage";

export const metadata = { title: "chính sách đổi trả — millions worldwide™" };

export default function RefundPage() {
  return (
    <PolicyPage title="Chính sách đổi trả">
      <h2>Điều kiện đổi trả</h2>
      <ul>
        <li>Đổi/trả trong vòng <strong>14 ngày</strong> kể từ ngày nhận hàng.</li>
        <li>Sản phẩm chưa qua sử dụng, chưa giặt, còn nguyên tem mác và phụ kiện đi kèm.</li>
        <li>Áp dụng cho lỗi từ nhà sản xuất, hoặc giao sai mẫu/sai số lượng so với đơn đã xác nhận.</li>
      </ul>
      <h2>Trường hợp không áp dụng</h2>
      <ul>
        <li>Sản phẩm đã qua sử dụng, giặt ủi hoặc có dấu hiệu hư hỏng do người dùng.</li>
        <li>Quá 14 ngày kể từ ngày nhận hàng.</li>
      </ul>
      <h2>Cách thực hiện</h2>
      <ul>
        <li>Liên hệ shop qua trang <a href="/contact">Liên hệ</a> kèm mã đơn hàng và lý do đổi/trả.</li>
        <li>Shop xác nhận và hướng dẫn cách gửi lại hàng. Khi nhận và kiểm tra xong, shop sẽ gửi sản phẩm thay thế hoặc hoàn tiền.</li>
        <li>Hoàn tiền qua chuyển khoản ngân hàng trong vòng 3–5 ngày làm việc sau khi shop nhận lại hàng đạt điều kiện.</li>
      </ul>
      <h2>Phí vận chuyển đổi trả</h2>
      <p>
        Miễn phí với lỗi từ nhà sản xuất hoặc giao sai hàng. Các trường hợp còn lại,
        phí vận chuyển phát sinh sẽ được thông báo cụ thể khi shop xác nhận yêu cầu.
      </p>
    </PolicyPage>
  );
}
