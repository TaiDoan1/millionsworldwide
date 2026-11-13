import Link from "next/link";
import PosScreen from "./PosScreen";
import { getProducts } from "../../actions/products";
import { getSettings } from "../../actions/settings";

// Orders and products change at runtime — always render fresh.
export const dynamic = "force-dynamic";

/**
 * POS — bán hàng tại quầy và lên đơn online nhanh, trong /mw-office nên
 * dùng chung đăng nhập quản trị, không cần tài khoản mới.
 */
export default async function PosPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let loadError: string | null = null;
  try {
    products = await getProducts();
  } catch {
    loadError =
      "Chưa tải được danh mục sản phẩm — kiểm tra kết nối kho dữ liệu rồi tải lại trang nhé.";
  }
  const settings = await getSettings().catch(() => null);

  return (
    <main className="min-h-screen bg-[#F8F8F8] text-black py-32 px-8">
      <div className="max-w-6xl mx-auto mb-10">
        <Link
          href="/mw-office"
          className="text-sm font-semibold underline underline-offset-4 hover:opacity-60"
        >
          ← Quản trị
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight mb-2">Bán hàng</h1>
        <p className="text-sm text-gray-500">
          Bán tại quầy (khách trả tiền mặt hoặc chuyển khoản, nhận hàng ngay)
          và lên đơn online nhanh khi khách nhắn tin — đơn lưu chung vào danh
          sách đơn hàng.
        </p>
      </div>
      {loadError ? (
        <div className="max-w-6xl mx-auto bg-white p-12 shadow-xl shadow-black/5">
          <p className="text-sm text-red-600">{loadError}</p>
        </div>
      ) : (
        <PosScreen
          products={products}
          bank={{
            code: settings?.bankCode ?? "",
            accountNumber: settings?.bankAccountNumber ?? "",
            accountName: settings?.bankAccountName ?? "",
          }}
        />
      )}
    </main>
  );
}
