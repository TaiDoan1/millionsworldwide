import PolicyPage from "../components/PolicyPage";

export const metadata = { title: "millions care — millions worldwide™" };

export default function MillionsCarePage() {
  return (
    <PolicyPage title="Millions Care">
      <p>
        Hướng dẫn chăm sóc sản phẩm để giữ form dáng và chi tiết nhận diện của
        Millions được lâu nhất.
      </p>
      <h2>Áo thun</h2>
      <ul>
        <li>Giặt mặt trái, nước lạnh, giặt cùng màu tương tự.</li>
        <li>Không ngâm lâu, không dùng chất tẩy mạnh lên hình in/logo.</li>
        <li>Phơi trong bóng râm; ủi mặt trái ở nhiệt độ thấp.</li>
      </ul>
      <h2>Denim</h2>
      <ul>
        <li>Hạn chế giặt thường xuyên để giữ màu và độ dập nổi của logo sau lưng.</li>
        <li>Khi giặt: lộn trái, cài nút/khóa, giặt nhẹ với nước lạnh.</li>
        <li>Phơi tự nhiên, tránh nắng gắt chiếu trực tiếp thời gian dài.</li>
      </ul>
      <h2>Sneakers</h2>
      <ul>
        <li>Vệ sinh bằng khăn mềm và dung dịch nhẹ; không giặt máy.</li>
        <li>Để khô tự nhiên, tránh máy sấy và nguồn nhiệt trực tiếp.</li>
        <li>Bảo quản nơi khô thoáng, nhét giấy giữ form khi không sử dụng.</li>
      </ul>
      <h2>Sweatpants</h2>
      <ul>
        <li>Giặt mặt trái với nước lạnh, phơi ngang hoặc treo bằng kẹp ở cạp quần.</li>
        <li>Tránh vắt mạnh để giữ form ống quần.</li>
      </ul>
    </PolicyPage>
  );
}
