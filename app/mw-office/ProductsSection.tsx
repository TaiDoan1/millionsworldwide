import Image from "next/image";
import { getAllProducts } from "../actions/products";
import { formatPrice } from "../lib/format";
import ProductAddForm from "./ProductAddForm";
import ProductEditForm from "./ProductEditForm";

/**
 * Product management on /mw-office. Self-fetching: when Postgres is not
 * configured (or unreachable) it renders the reason instead of an empty
 * list, so an empty catalog is never mistaken for "no products".
 */
export default async function ProductsSection() {
  let products: Awaited<ReturnType<typeof getAllProducts>> | null = null;
  let error: string | null = null;
  try {
    products = await getAllProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Không tải được danh sách sản phẩm.";
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-12 shadow-xl shadow-black/5 mt-10">
      <h2 className="text-2xl font-bold tracking-tight mb-1">
        Sản phẩm{products ? ` (${products.length})` : ""}
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Sửa giá, giá gốc, tên, danh mục, hết hàng, đặt trước, ẩn/hiện, size
        và thông số từng món — đổi có hiệu lực ngay trên web, không cần
        đẩy code. Ảnh vẫn thay bằng code; thêm món mới thì ảnh phải là
        đường dẫn file đã có sẵn trong web.
      </p>
      {error || !products ? (
        <p className="text-sm text-gray-400">
          {error ?? "Không tải được danh sách sản phẩm."}
        </p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có sản phẩm nào.</p>
      ) : (
        <>
          <details className="mb-6">
            <summary className="cursor-pointer text-sm font-bold tracking-wider uppercase hover:text-black w-fit">
              + Thêm sản phẩm mới
            </summary>
            <div className="mt-3 border border-neutral-200 p-4">
              <ProductAddForm />
            </div>
          </details>
          <ul className="divide-y divide-neutral-100">
          {products.map((p) => (
            <li key={p.id} className="py-4">
              <div className="flex items-center gap-4">
                {p.images[0] ? (
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-sm object-cover bg-neutral-100"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-sm bg-neutral-100" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold uppercase truncate">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(p.price)} · {p.category}
                    {p.compareAt ? ` · Giá gốc ${formatPrice(p.compareAt)}` : ""}
                    {p.soldOut ? " · Hết hàng" : ""}
                    {p.preOrder ? " · Đặt trước" : ""}
                    {p.hidden ? " · Đang ẩn khỏi shop" : ""}
                  </p>
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-black w-fit">
                  Sửa
                </summary>
                <div className="mt-3 border border-neutral-200 p-4">
                  <ProductEditForm product={p} />
                </div>
              </details>
            </li>
          ))}
        </ul>
        </>
      )}
    </div>
  );
}
