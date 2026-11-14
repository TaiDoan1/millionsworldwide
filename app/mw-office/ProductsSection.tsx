import { getAllProducts } from "../actions/products";
import { getAllCategories } from "../actions/categories";
import { SEED_CATEGORIES } from "../data/products";
import { AdminSection } from "./ui";
import ProductAddForm from "./ProductAddForm";
import ProductsList from "./ProductsList";
import CategoriesManager from "./CategoriesManager";

/**
 * Product management on /mw-office. Self-fetching: when Postgres is not
 * configured (or unreachable) it renders the reason instead of an empty
 * list, so an empty catalog is never mistaken for "no products".
 *
 * Categories live in this same section now (below the product list):
 * they are product metadata, and the list is only a handful of rows.
 */
export default async function ProductsSection() {
  let products: Awaited<ReturnType<typeof getAllProducts>> | null = null;
  let error: string | null = null;
  try {
    products = await getAllProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Không tải được danh sách sản phẩm.";
  }
  // Categories for the forms' dropdowns and the "món lẻ" picker: the
  // seed list when the live list can't be read (the save still checks
  // against the live list server-side).
  let categories = SEED_CATEGORIES;
  try {
    categories = await getAllCategories();
  } catch {
    // Keep the seed fallback.
  }

  // Product counts per category, for the delete guard's display.
  const counts: Record<string, number> = {};
  if (products) {
    for (const p of products) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
  }

  return (
    <AdminSection
      id="san-pham"
      title={`Sản phẩm & Danh mục${products ? ` (${products.length})` : ""}`}
      description="Sửa giá, giá gốc, tên, danh mục, hết hàng, đặt trước, ẩn/hiện, size, màu, món lẻ trong set (link sản phẩm riêng) và thông số từng món — đổi có hiệu lực ngay trên web, không cần đẩy code. Ảnh mới tải lên bằng nút trong form (lưu vào Volume của web, hiện ngay sau khi lưu); ảnh có sẵn trong web thì ghi đường dẫn tay."
    >
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
              <ProductAddForm products={products} categories={categories} />
            </div>
          </details>
          <ProductsList products={products} categories={categories} />
          <div className="mt-10 border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-bold tracking-tight">
              Danh mục ({categories.length})
            </h3>
            <p className="text-base text-gray-600 mb-6 mt-1">
              Thêm, đổi tên và xếp thứ tự danh mục — chip lọc trên trang
              shop và menu danh mục tự cập nhật theo, không cần đẩy code.
              Mã danh mục (slug) đặt một lần lúc thêm, không đổi được vì
              sản phẩm đang dùng nó. Danh mục còn sản phẩm thì chưa xóa
              được.
            </p>
            <CategoriesManager
              key={categories.map((c) => `${c.slug}:${c.label}`).join("|")}
              categories={categories}
              counts={counts}
            />
          </div>
        </>
      )}
    </AdminSection>
  );
}
