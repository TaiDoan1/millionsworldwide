import PolicyPage from "../components/PolicyPage";
import TrackOrderForm from "./TrackOrderForm";

export const metadata = { title: "theo dõi đơn hàng — millions worldwide™" };

export default function TrackOrderPage() {
  return (
    <PolicyPage title="Theo dõi đơn hàng">
      <p>
        Nhập mã đơn hàng (shop gửi khi anh/chị đặt hàng thành công) và số điện thoại
        đã dùng để đặt hàng.
      </p>
      <TrackOrderForm />
    </PolicyPage>
  );
}
