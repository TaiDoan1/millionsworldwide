import PolicyPage from "../components/PolicyPage";

export const metadata = { title: "chính sách kiểm hàng — millions worldwide™" };

export default function InspectionPage() {
  return (
    <PolicyPage title="Chính sách kiểm hàng">
      <h2>Kiểm hàng khi nhận</h2>
      <ul>
        <li>Với đơn COD, anh/chị được mở và kiểm tra sản phẩm trước khi thanh toán cho nhân viên giao hàng.</li>
        <li>Nội dung kiểm tra: đúng mẫu mã, màu sắc, số lượng và tình trạng bên ngoài của sản phẩm.</li>
      </ul>
      <h2>Khi phát hiện vấn đề</h2>
      <ul>
        <li>Nếu sai mẫu/sai số lượng hoặc sản phẩm lỗi nhìn thấy được, anh/chị có thể từ chối nhận và thông báo ngay cho shop.</li>
        <li>Nếu đã nhận hàng mới phát hiện lỗi, vui lòng liên hệ trong vòng 48 giờ kèm hình ảnh/video tình trạng sản phẩm để được hỗ trợ đổi trả theo <a href="/refund-policy">Chính sách đổi trả</a>.</li>
      </ul>
      <p>
        Việc kiểm hàng không bao gồm thử mặc hoặc sử dụng sản phẩm; sản phẩm đổi trả
        cần giữ nguyên tem mác theo chính sách đổi trả.
      </p>
    </PolicyPage>
  );
}
