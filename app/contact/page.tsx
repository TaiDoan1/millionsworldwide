import PolicyPage from "../components/PolicyPage";

export const metadata = { title: "liên hệ — millions worldwide™" };

export default function ContactPage() {
  return (
    <PolicyPage title="Liên hệ">
      <p>
        Millions Worldwide là cửa hàng trực tuyến — chúng tôi hỗ trợ khách hàng qua
        các kênh online dưới đây.
      </p>
      <h2>Giờ hỗ trợ</h2>
      <p>Thứ 2 – Chủ nhật, 10:00 – 21:30 (GMT+7).</p>
      <h2>Kênh liên hệ</h2>
      <ul>
        <li>
          Instagram:{" "}
          <a href="https://www.instagram.com/millions.worldwide" target="_blank" rel="noopener noreferrer">
            @millions.worldwide
          </a>
        </li>
        <li>
          Facebook:{" "}
          <a href="https://www.facebook.com/share/14sNnRXMaZJ/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
            Millions Worldwide
          </a>
        </li>
      </ul>
      <h2>Hỗ trợ đơn hàng</h2>
      <p>
        Khi nhắn tin, anh/chị vui lòng kèm <strong>mã đơn hàng</strong> và{" "}
        <strong>số điện thoại đặt hàng</strong> để shop tra cứu nhanh nhất. Kiểm tra
        trạng thái đơn bất cứ lúc nào tại trang{" "}
        <a href="/track-order">Theo dõi đơn hàng</a>.
      </p>
      <p>
        Các vấn đề thường gặp về đổi trả, vận chuyển và thanh toán đã có sẵn tại các
        trang chính sách ở cuối trang này.
      </p>
    </PolicyPage>
  );
}
