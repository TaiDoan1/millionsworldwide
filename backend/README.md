# Backend — code chạy trên máy chủ

Thư mục này là toàn bộ "backend" của shop. Khách hàng không bao giờ thấy
hay chạy trực tiếp code ở đây — trình duyệt chỉ gọi vào nó qua lớp
`app/actions/` (xem quy tắc bên dưới).

## Bản đồ Frontend / Backend

| Phần | Nằm ở đâu | Làm gì |
| --- | --- | --- |
| Frontend — trang | `app/` (page, layout, template) | Đường dẫn nào hiện trang nào |
| Frontend — giao diện | `app/components/`, `app/features/` | Những gì khách thấy và bấm vào |
| Frontend — hàm dùng chung | `app/lib/format.ts` | Định dạng giá tiền |
| **Backend — cửa ngõ** | `app/actions/` (lớp mỏng) | Hàm server action frontend gọi vào |
| **Backend — nghiệp vụ** | `backend/services/` | Quy tắc: tính giá, tạo mã đơn, kiểm tra đầu vào |
| **Backend — lưu trữ** | `backend/storage/` | Đọc/ghi đơn, email, cài đặt (file hoặc Vercel KV) |
| **Backend — xác thực** | `backend/auth/` | Kiểm tra tài khoản admin |
| **Backend — chống lạm dụng** | `backend/security/` | Giới hạn số lần gửi form theo IP |
| **Backend — cấu hình** | `backend/config/` | Domain chính cho sitemap/metadata |
| **Backend — cổng** | `proxy.ts` (bắt buộc ở root theo chuẩn Next.js) | Chặn `/mw-office` bằng Basic Auth |

## Quy tắc ranh giới (đọc trước khi sửa)

1. Frontend gọi backend **chỉ qua `app/actions/`**. Không import thẳng
   `backend/storage` hay `backend/services` từ component.
2. Backend **không import giao diện** (không import component, CSS, ảnh).
3. Giá tiền, mã đơn, trạng thái đơn chỉ được quyết ở
   `backend/services/` — frontend gửi id + số lượng, backend tính lại.
4. Dữ liệu dùng chung (bảng sản phẩm) nằm ở `app/data/products.ts`:
   backend sở hữu giá, frontend chỉ đọc để hiển thị.

## Luồng chạy chính

- **Đặt đơn**: giỏ hàng → `app/actions/orders.ts` → `backend/services/orders.ts`
  (chống spam → kiểm tra đầu vào → tính lại giá từ catalogue → lưu qua
  `backend/storage/`) → trả mã đơn `MW-...`.
- **Đăng ký email**: form → `app/actions/subscribers.ts` →
  `backend/services/subscribers.ts` (chống trùng email) → `backend/storage/`.
- **Đổi cài đặt**: form admin → `app/actions/settings.ts` →
  `backend/services/settings.ts` (kiểm tra lại tài khoản admin qua
  `backend/auth/` rồi mới ghi) → `backend/storage/`.
- **Tra đơn**: form → `app/actions/orders.ts` → `backend/services/orders.ts`
  (đối chiếu mã đơn + số điện thoại, không lộ thông tin khách khác).

## Dữ liệu nằm ở đâu

- Đơn, email, cài đặt lưu trong file JSON tại `DATA_DIR` (trên Railway là
  Volume `/data`), hoặc Vercel KV nếu gắn KV. Code trong `backend/storage/`
  tự chọn theo môi trường.
- File `app/data/*.json` trong repo chỉ là dữ liệu mẫu/seed — **không dời
  hay đổi tên chúng**: `backend/storage/file.ts` đọc seed từ
  `app/data/settings.json` theo đường dẫn tuyệt đối từ root project, và
  cổng Coming Soon dựa vào seed này khi volume trống.

## Backend chuẩn còn thiếu gì (để sau này)

- Database thật (Postgres) thay cho file JSON khi đơn nhiều lên.
- Cổng thanh toán tự động thay cho COD/chuyển khoản xác nhận tay.
- Log có cấu trúc và sao lưu tự động (hiện chỉ có log console + Volume).
