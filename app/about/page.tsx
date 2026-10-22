import PolicyPage from "../components/PolicyPage";

export const metadata = { title: "giới thiệu — millions worldwide™" };

export default function AboutPage() {
  return (
    <PolicyPage title="Giới thiệu">
      <p>
        Millions Worldwide là thương hiệu thời trang đường phố đến từ Việt Nam, xây
        dựng cho những người chọn form dáng thay vì ồn ào — &quot;built for those who
        choose form over noise&quot;.
      </p>
      <p>
        Mỗi sản phẩm đều được thiết kế và sản xuất tại Việt Nam: từ áo thun logo
        signature, giày sneakers cho đến sweatpants. Chúng tôi chú trọng phom dáng,
        chất liệu và những chi tiết nhận diện riêng của Millions — như logo tròn dập
        nổi trên các thiết kế denim.
      </p>
      <h2>Mua sắm tại Millions</h2>
      <p>
        Millions hoạt động dưới hình thức cửa hàng trực tuyến. Anh/chị có thể xem toàn
        bộ sản phẩm, đặt hàng và thanh toán khi nhận hàng (COD) hoặc chuyển khoản ngay
        trên website này.
      </p>
      <h2>Liên hệ</h2>
      <p>
        Đội ngũ hỗ trợ làm việc Thứ 2 – Chủ nhật, 10:00 – 21:30 (GMT+7). Chi tiết tại
        trang <a href="/contact">Liên hệ</a>.
      </p>
    </PolicyPage>
  );
}
