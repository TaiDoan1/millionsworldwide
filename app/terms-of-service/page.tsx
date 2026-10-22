import PolicyPage from "../components/PolicyPage";

export const metadata = { title: "điều khoản dịch vụ — millions worldwide™" };

export default function TermsPage() {
  return (
    <PolicyPage title="Điều khoản dịch vụ">
      <p>
        Khi truy cập và mua hàng tại website Millions Worldwide, anh/chị đồng ý với
        các điều khoản dưới đây.
      </p>
      <h2>1. Sản phẩm và giá bán</h2>
      <ul>
        <li>Giá niêm yết trên website là giá bán cuối cùng, tính bằng Việt Nam đồng (₫), đã bao gồm phí vận chuyển (miễn phí vận chuyển toàn quốc).</li>
        <li>Hình ảnh sản phẩm mang tính minh họa; màu sắc thực tế có thể chênh lệch nhẹ do ánh sáng và màn hình hiển thị.</li>
        <li>Millions có quyền điều chỉnh giá và tình trạng còn hàng mà không cần báo trước; giá áp dụng là giá tại thời điểm đơn hàng được xác nhận.</li>
      </ul>
      <h2>2. Đặt hàng và xác nhận</h2>
      <ul>
        <li>Đơn hàng chỉ được xem là thành công khi shop liên hệ xác nhận qua điện thoại/tin nhắn.</li>
        <li>Nếu thông tin liên hệ không chính xác hoặc không liên lạc được sau 3 lần, đơn hàng có thể bị hủy.</li>
        <li>Sản phẩm pre-order sẽ có thời gian giao riêng, được thông báo khi xác nhận đơn.</li>
      </ul>
      <h2>3. Thanh toán</h2>
      <p>
        Chi tiết tại <a href="/payment">Chính sách thanh toán</a>.
      </p>
      <h2>4. Đổi trả hàng</h2>
      <p>
        Chi tiết tại <a href="/refund-policy">Chính sách đổi trả</a>.
      </p>
      <h2>5. Sở hữu trí tuệ</h2>
      <p>
        Toàn bộ nội dung, hình ảnh và thiết kế trên website thuộc quyền sở hữu của
        Millions Worldwide. Nghiêm cấm sao chép hoặc sử dụng cho mục đích thương mại
        khi chưa có sự đồng ý bằng văn bản.
      </p>
      <h2>6. Thay đổi điều khoản</h2>
      <p>
        Millions có thể cập nhật điều khoản theo thời gian. Phiên bản hiện hành luôn
        được đăng tại trang này và có hiệu lực ngay khi đăng tải.
      </p>
    </PolicyPage>
  );
}
