import AdminForm from "./AdminForm"
import { getSettings } from "../actions/settings"
import { getOrders } from "../actions/orders"
import { getSubscribers } from "../actions/subscribers"

// Orders and subscribers change at runtime — always render fresh.
export const dynamic = "force-dynamic"

function formatPrice(n: number) {
  return `${(n * 1000).toLocaleString("en-US")}₫`
}

const STATUS_LABELS: Record<string, string> = {
  new: "Mới đặt",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

export default async function AdminPage() {
  const currentSettings = await getSettings()
  const orders = (await getOrders().catch(() => [])).slice().reverse()
  const subscribers = (await getSubscribers().catch(() => [])).slice().reverse()

  return (
    <main className="min-h-screen bg-[#F8F8F8] text-black py-32 px-8">
      <div className="max-w-xl mx-auto bg-white p-12 shadow-xl shadow-black/5">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Banner Admin</h1>
        <p className="text-sm text-gray-500 mb-10">Manage layout and colors for your homepage.</p>
        <AdminForm initialSettings={currentSettings} />
      </div>

      <div className="max-w-3xl mx-auto bg-white p-12 shadow-xl shadow-black/5 mt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-1">Đơn hàng ({orders.length})</h2>
        <p className="text-sm text-gray-500 mb-8">Đơn mới nhất xếp trước. Khách tra cứu trạng thái bằng mã đơn + số điện thoại tại /track-order.</p>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((o) => (
              <div key={o.code} className="border border-neutral-200 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-black tracking-wider">{o.code}</p>
                  <p className="text-xs text-gray-500">{new Date(o.at).toLocaleString("vi-VN")}</p>
                </div>
                <p className="mt-1 text-sm">
                  {o.customer.name} — {o.customer.phone}
                  <span className="text-gray-500"> · {o.customer.address}</span>
                </p>
                {o.customer.note && <p className="text-sm text-gray-500">Ghi chú: {o.customer.note}</p>}
                <ul className="mt-2 text-sm text-gray-700">
                  {o.items.map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span className="uppercase">{i.name} × {i.qty}</span>
                      <span>{formatPrice(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 text-sm font-bold">
                  <span>
                    Tổng · {o.payment === "cod" ? "COD" : "Chuyển khoản"} · {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                  <span>{formatPrice(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto bg-white p-12 shadow-xl shadow-black/5 mt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-1">Email đăng ký ({subscribers.length})</h2>
        <p className="text-sm text-gray-500 mb-8">Từ form NOTIFY ME (coming-soon) và newsletter cuối trang.</p>
        {subscribers.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có email nào.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 text-sm">
            {subscribers.map((s) => (
              <li key={s.email} className="flex flex-wrap justify-between gap-2 py-2.5">
                <span className="font-medium">{s.email}</span>
                <span className="text-gray-500">
                  {s.source} · {new Date(s.at).toLocaleString("vi-VN")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
