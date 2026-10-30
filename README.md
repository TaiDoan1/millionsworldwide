# Millions Worldwide — Website bán hàng

Website cửa hàng thời trang Millions Worldwide, chạy bằng Next.js 16 +
TypeScript + Tailwind 4 + Three.js. Đây đồng thời là **bản mẫu gốc**: mở
thương hiệu mới thì clone repo này rồi làm theo mục "Clone cho thương hiệu
mới" bên dưới, không làm lại từ đầu.

## Chạy

```bash
npm install
npm run dev      # chạy máy mình, http://localhost:3000
npm run build    # build bản production
npm run start    # chạy bản production vừa build
npm run lint     # kiểm tra lint
npm run typecheck
```

## Cấu trúc

```
app/
├── layout.tsx            # khung chung mọi trang (header, font, metadata)
├── template.tsx          # hiệu ứng chuyển trang (mờ + trồi lên 0.7s)
├── globals.css           # CSS dùng chung
├── page.tsx              # trang chủ /
├── trangchu/             # shop /trangchu (+ [id] = trang chi tiết)
├── about, contact, ...   # mỗi thư mục là 1 trang (chính sách, tra đơn...)
├── components/           # UI dùng chung + khung ráp trang (giỏ hàng, logo 3D...)
├── features/             # từng mảng chức năng, mỗi mảng tự chứa UI của nó
│   ├── home/             # hero, marquee, tiles, editorial, arrivals
│   ├── product/          # gallery, buy box, accordions, phối cùng
│   ├── cart/             # dòng giỏ, tổng tiền, form đặt hàng, màn thành công
│   └── shop/             # chip danh mục, thanh sắp xếp, tùy chọn lọc/sắp xếp
├── data/                 # dữ liệu: products.ts, settings.json
├── actions/              # code chạy phía server: đặt hàng, đăng ký email
└── lib/                  # hàm dùng chung + lớp lưu trữ (file hoặc KV)
proxy.ts                 # cổng bảo vệ /admin (Basic Auth)
public/                  # file tĩnh: ảnh, video, logo
```

Quy tắc chia tầng: route chỉ lo "URL nào hiện cái gì", component chỉ lo
hiển thị, dữ liệu tách riêng khỏi giao diện, việc nhạy cảm (tính tiền, lưu
đơn) chạy phía server. Mỗi feature trong `features/` tự chứa UI của nó,
trang trong `components/` chỉ còn là khung ráp + state chung — file nào
cũng dưới ~120 dòng nên sửa 1 chỗ không sợ chạm chỗ khác. Logic lặp lại ở
nhiều component thì tách thành hook riêng; trạng thái chia sẻ cả cây trang
(giỏ hàng) thì dùng context.

## Biến môi trường

Copy `.env.example` thành `.env.local` khi chạy máy mình. Trên Railway đặt
trong Variables. Không commit file `.env` thật (`.gitignore` đã chặn).

| Biến | Bắt buộc | Ý nghĩa |
| --- | --- | --- |
| `ADMIN_USER`, `ADMIN_PASS` | Trên production | Tài khoản trang quản trị `/admin`. Thiếu là `/admin` khóa hẳn (401). |
| `DATA_DIR` | Nên có | Thư mục lưu đơn, email, cài đặt. Trên Railway gắn Volume tại `/data` rồi đặt `DATA_DIR=/data` để dữ liệu không mất khi deploy lại. |
| `NEXT_PUBLIC_SITE_URL` | Nên có | Domain chính, dùng cho sitemap và thẻ chia sẻ. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Không | Chỉ khi deploy trên Vercel: dùng Vercel KV thay cho lưu file. |

## Deploy (Railway)

Đẩy lên nhánh `main` là Railway tự deploy. Cần có sẵn trong project:
Volume gắn tại `/data` + biến `DATA_DIR=/data`,
`NEXT_PUBLIC_SITE_URL=https://millionsworldwide.com`,
`ADMIN_USER` + `ADMIN_PASS` (tự đặt, không ghi vào code).

## Bảo mật — đã có

- **Trang quản trị khóa 2 lớp**: `proxy.ts` chặn `/admin` bằng Basic Auth,
  và action đổi cài đặt kiểm tra lại tài khoản trong code
  (`app/lib/admin-auth.ts`). Đơn hàng chứa họ tên, số điện thoại, địa chỉ
  của khách — không chia sẻ tài khoản admin cho ai ngoài người quản lý shop.
- **Security headers** (`next.config.ts`): chống đoán kiểu file, chống nhúng
  iframe, giới hạn quyền trình duyệt, ép HTTPS (HSTS).
- **Giá tính lại phía server**: giỏ hàng chỉ gửi id + số lượng, tiền được
  tính lại từ bảng giá trong code — khách không sửa được giá.
- **Chống spam form**: giới hạn 10 đơn / 10 phút / IP, 10 đăng ký / 10
  phút / IP, 30 tra cứu đơn / 10 phút / IP; giới hạn độ dài họ tên, địa
  chỉ, ghi chú.
- **Không secret trong code**: token, mật khẩu chỉ qua biến môi trường.
- **Dữ liệu khách không lọt lên Google**: `/admin` trả kèm
  `X-Robots-Tag: noindex`, trang 404 tự có `noindex`.

Chưa bật CSP nghiêm ngặt vì logo 3D (Three.js) và analytics dùng
inline style/script mà CSP nghiêm sẽ làm vỡ giao diện — khi nào bỏ 2 thứ
đó khỏi inline thì mới bật được.

## Chuẩn thị trường — đã có

Sitemap, robots, thẻ OG/Twitter, 11 trang chính sách (đổi trả, vận chuyển,
thanh toán, bảo mật...), trang 404 và trang lỗi riêng bằng tiếng Việt,
theo dõi lượt xem bằng analytics, ảnh sản phẩm tối ưu 1000×1333.

## Cố tình làm thủ công (không phải thiếu)

- **Thanh toán**: COD hoặc chuyển khoản, shop gọi điện xác nhận đơn rồi mới
  gửi thông tin chuyển khoản — chưa gắn cổng thanh toán tự động.
- **Size**: shop xác nhận size khi gọi xác nhận đơn, web không bắt khách
  chọn size.
- **Sao lưu**: đơn hàng nằm trên Volume Railway. Nên vào `/admin` đối
  chiếu và xuất đơn định kỳ; Volume không tự thay thế việc sao lưu.

## Clone cho thương hiệu mới

1. Clone repo ra repo mới, đổi `name` trong `package.json`.
2. Thay `app/data/products.ts` (tên, giá, ảnh) và ảnh trong
   `public/products/`; thay logo (`public/logo-spin.png`,
   `app/components/logo_points.json` nếu đổi dáng chữ).
3. Sửa metadata trong `app/layout.tsx` (tên shop, mô tả, ảnh OG) và nội
   dung các trang chính sách cho đúng shop mới.
4. Reset dữ liệu mẫu: `app/data/orders.json` và `app/data/subscribers.json`
   về `[]`; sửa seed trong `app/data/settings.json` (ngày ra mắt, tiêu đề
   cổng Coming Soon) nếu dùng.
5. Tạo project Railway mới + Volume `/data` riêng, đặt lại toàn bộ biến
   môi trường, đặc biệt `ADMIN_USER` / `ADMIN_PASS` mới và
   `NEXT_PUBLIC_SITE_URL` mới.
6. Kiểm tra: build đạt, `/admin` hỏi tài khoản mới, đặt thử 1 đơn rồi tra
   cứu bằng mã đơn, xem sitemap trỏ đúng domain mới.
