import PolicyPage from "../components/PolicyPage";

export const metadata = { title: "chính sách thanh toán — millions worldwide™" };

export default function PaymentPage() {
  return (
    <PolicyPage title="Chính sách thanh toán">
      <p>Millions Worldwide hỗ trợ hai hình thức thanh toán:</p>
      <h2>1. Thanh toán khi nhận hàng (COD)</h2>
      <ul>
        <li>Thanh toán tiền mặt cho nhân viên giao hàng sau khi kiểm tra hàng.</li>
        <li>Áp dụng cho mọi đơn hàng trên toàn quốc.</li>
      </ul>
      <h2>2. Chuyển khoản ngân hàng</h2>
      <ul>
        <li>Sau khi đặt hàng, shop sẽ liên hệ xác nhận đơn và gửi thông tin chuyển khoản chính xác kèm mã đơn hàng.</li>
        <li>Nội dung chuyển khoản: mã đơn hàng + số điện thoại, để shop đối soát nhanh nhất.</li>
        <li>Đơn chỉ được xử lý giao đi sau khi shop nhận được chuyển khoản.</li>
      </ul>
      <h2>Lưu ý an toàn</h2>
      <p>
        Millions chỉ gửi thông tin chuyển khoản khi xác nhận đơn qua các kênh liên hệ
        chính thức tại trang <a href="/contact">Liên hệ</a>. Anh/chị vui lòng không
        chuyển khoản tới bất kỳ tài khoản nào khác tự xưng là Millions Worldwide.
      </p>
    </PolicyPage>
  );
}
