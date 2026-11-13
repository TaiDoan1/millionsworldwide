import AdminForm from "./AdminForm"
import CsvButton from "./CsvButton"
import LogoutButton from "./LogoutButton"
import { AdminSection } from "./ui"
import { csvRow } from "../lib/csv"
import OrdersManager from "./OrdersManager"
import ProductsSection from "./ProductsSection"
import CategoriesSection from "./CategoriesSection"
import { getSettings } from "../actions/settings"
import { storageBackendLabel } from "../../backend/storage"
import { getOrders } from "../actions/orders"
import { getSubscribers } from "../actions/subscribers"
import { getAllProducts } from "../actions/products"
import { formatPrice } from "../lib/format"

// Orders and subscribers change at runtime — always render fresh.
export const dynamic = "force-dynamic"

const NAV = [
  { href: "/mw-office/pos", label: "Bán hàng" },
  { href: "#tong-quan", label: "Tổng quan" },
  { href: "#don-hang", label: "Đơn hàng" },
  { href: "#san-pham", label: "Sản phẩm" },
  { href: "#danh-muc", label: "Danh mục" },
  { href: "#email", label: "Email" },
  { href: "#cai-dat", label: "Cài đặt" },
]

export default async function AdminPage() {
  const currentSettings = await getSettings()
  const orders = (await getOrders().catch(() => [])).slice().reverse()
  const subscribers = (await getSubscribers().catch(() => [])).slice().reverse()
  const backendLabel = await storageBackendLabel()

  // Product counts for the dashboard (the section below loads the list
  // itself; a failure here only blanks the product stats, not the page).
  let productCount: number | null = null
  let hiddenCount: number | null = null
  let soldOutCount: number | null = null
  try {
    const all = await getAllProducts()
    productCount = all.length
    hiddenCount = all.filter((p) => p.hidden).length
    soldOutCount = all.filter((p) => p.soldOut).length
  } catch {
    // Products section explains the problem.
  }

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0)
  const newOrders = orders.filter((o) => o.status === "new").length

  let subscribersCsv = csvRow(["Email", "Nguồn", "Ngày"])
  for (const s of subscribers) {
    subscribersCsv += csvRow([
      s.email,
      s.source,
      new Date(s.at).toLocaleString("vi-VN"),
    ])
  }

  const stats: { label: string; value: string }[] = [
    { label: "Đơn hàng", value: String(orders.length) },
    { label: "Đơn mới", value: String(newOrders) },
    { label: "Doanh thu (trừ đơn hủy)", value: formatPrice(revenue) },
    { label: "Email đăng ký", value: String(subscribers.length) },
    {
      label: "Sản phẩm đang bán",
      value: productCount === null ? "—" : String(productCount - (hiddenCount ?? 0)),
    },
    {
      label: "Hết hàng / Đang ẩn",
      value:
        soldOutCount === null || hiddenCount === null
          ? "—"
          : `${soldOutCount} / ${hiddenCount}`,
    },
  ]

  return (
    <main className="min-h-screen bg-[#F8F8F8] text-black px-4 py-24 sm:px-8 sm:py-32">
      <div className="max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Quản trị Millions</h1>
        <p className="text-base text-gray-600 mb-6">Đơn hàng, sản phẩm, email và nội dung web — thay đổi có hiệu lực ngay.</p>
        <nav className="flex flex-wrap gap-2">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold tracking-widest uppercase hover:border-black transition-colors"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>

      <AdminSection
        id="tong-quan"
        title="Tổng quan"
        description={`Kho dữ liệu: ${backendLabel}`}
        descriptionClassName="text-xs text-gray-400 mb-8"
        noTopMargin
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="border border-neutral-200 p-4 min-w-0">
              <p className="text-2xl font-black break-all sm:text-3xl">{s.value}</p>
              <p className="text-sm text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection
        id="don-hang"
        title={`Đơn hàng (${orders.length})`}
        description="Đơn mới nhất xếp trước. Khách tra cứu trạng thái bằng mã đơn + số điện thoại tại /track-order."
      >
        {orders.length === 0 ? (
          <p className="text-base text-gray-500">Chưa có đơn hàng nào.</p>
        ) : (
          <OrdersManager orders={orders} />
        )}
      </AdminSection>

      <ProductsSection />

      <CategoriesSection />

      <AdminSection
        id="email"
        title={`Email đăng ký (${subscribers.length})`}
        description="Từ form NOTIFY ME (coming-soon) và newsletter cuối trang."
        actions={
          subscribers.length > 0 ? (
            <CsvButton
              filename="millions-email-dang-ky.csv"
              csv={subscribersCsv}
              label="Xuất CSV"
            />
          ) : undefined
        }
      >
        {subscribers.length === 0 ? (
          <p className="text-base text-gray-500">Chưa có email nào.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 text-base">
            {subscribers.map((s) => (
              <li key={s.email} className="flex flex-wrap justify-between gap-2 py-2.5">
                <span className="font-medium">{s.email}</span>
                <span className="text-gray-600">
                  {s.source} · {new Date(s.at).toLocaleString("vi-VN")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminSection>

      <AdminSection id="cai-dat" title="Cài đặt" narrow>
        <AdminForm initialSettings={currentSettings} />
      </AdminSection>
    </main>
  )
}
