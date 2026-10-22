import PolicyPage from "../components/PolicyPage";

export const metadata = { title: "chính sách bảo mật — millions worldwide™" };

export default function PrivacyPage() {
  return (
    <PolicyPage title="Chính sách bảo mật">
      <h2>Thông tin chúng tôi thu thập</h2>
      <ul>
        <li>Thông tin đặt hàng: họ tên, số điện thoại, địa chỉ giao hàng và ghi chú đơn hàng.</li>
        <li>Địa chỉ email khi anh/chị đăng ký nhận tin (màn hình Coming Soon hoặc newsletter cuối trang).</li>
      </ul>
      <h2>Mục đích sử dụng</h2>
      <ul>
        <li>Xác nhận, giao hàng và hỗ trợ sau bán hàng.</li>
        <li>Gửi thông tin ra mắt, bộ sưu tập mới và ưu đãi (chỉ với email đã đăng ký nhận tin).</li>
      </ul>
      <h2>Chia sẻ thông tin</h2>
      <p>
        Millions không bán hoặc cho thuê thông tin cá nhân của khách hàng. Thông tin
        chỉ được chia sẻ với đơn vị vận chuyển ở mức cần thiết để giao đơn hàng.
      </p>
      <h2>Quyền của khách hàng</h2>
      <p>
        Anh/chị có thể yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất
        cứ lúc nào qua trang <a href="/contact">Liên hệ</a>. Email nhận tin có thể hủy
        đăng ký bằng cách liên hệ shop.
      </p>
    </PolicyPage>
  );
}
