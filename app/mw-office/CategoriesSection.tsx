import { getAllCategories } from "../actions/categories";
import { getAllProducts } from "../actions/products";
import { AdminSection } from "./ui";
import CategoriesManager from "./CategoriesManager";

/**
 * Category management on /mw-office. Self-fetching, like the products
 * section: when Postgres is not configured (or unreachable) it renders
 * the reason instead of an empty list.
 */
export default async function CategoriesSection() {
  let categories: Awaited<ReturnType<typeof getAllCategories>> | null = null;
  let error: string | null = null;
  try {
    categories = await getAllCategories();
  } catch (e) {
    error = e instanceof Error ? e.message : "Không tải được danh sách danh mục.";
  }

  // Product counts per category, for the delete guard's display.
  const counts: Record<string, number> = {};
  try {
    const products = await getAllProducts();
    for (const p of products) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
  } catch {
    // Counts stay empty; the server still guards the delete.
  }

  return (
    <AdminSection
      id="danh-muc"
      title={`Danh mục${categories ? ` (${categories.length})` : ""}`}
      description="Thêm, đổi tên và xếp thứ tự danh mục — chip lọc trên trang shop và menu danh mục tự cập nhật theo, không cần đẩy code. Mã danh mục (slug) đặt một lần lúc thêm, không đổi được vì sản phẩm đang dùng nó. Danh mục còn sản phẩm thì chưa xóa được."
    >
      {error || !categories ? (
        <p className="text-sm text-gray-400">
          {error ?? "Không tải được danh sách danh mục."}
        </p>
      ) : (
        <CategoriesManager
          key={categories.map((c) => `${c.slug}:${c.label}`).join("|")}
          categories={categories}
          counts={counts}
        />
      )}
    </AdminSection>
  );
}
