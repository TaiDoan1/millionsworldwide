/**
 * Backend service: product categories. Called only via
 * app/actions/categories.ts.
 *
 * Two read modes, mirroring the products service:
 * - Display (getCategories): Postgres when configured, the code seed
 *   otherwise; a DB error falls back to the seed so the shop keeps its
 *   filter chips and menu tabs.
 * - Admin (getAllCategories): throws without Postgres — category edits
 *   are an admin feature of the Postgres deployment.
 */
import { revalidatePath } from "next/cache";
import { SEED_CATEGORIES, type ProductCategory } from "../../app/data/products";
import { postgresConfigured } from "../storage/postgres";
import {
  deleteCategory as deleteStoredCategory,
  insertCategory as insertStoredCategory,
  listCategories as listStoredCategories,
  updateCategory as updateStoredCategory,
  type CategoryInput,
} from "../storage/categories";
import { listProducts as listStoredProducts } from "../storage/products";
import { isAdminRequest } from "../auth/admin-auth";
import {
  validateCategoryInput,
  validateCategoryLabel,
} from "./categories-validation";

export type { ProductCategory };

export async function getCategories(): Promise<ProductCategory[]> {
  if (!postgresConfigured()) return SEED_CATEGORIES;
  try {
    return await listStoredCategories();
  } catch (error) {
    console.error("Failed to read categories, falling back to seed:", error);
    return SEED_CATEGORIES;
  }
}

/** Full category list, for /mw-office. */
export async function getAllCategories(): Promise<ProductCategory[]> {
  if (!postgresConfigured()) {
    throw new Error("Cần kết nối Postgres để quản lý danh mục.");
  }
  return listStoredCategories();
}

/** Admin-only insert. */
export async function addCategory(
  c: CategoryInput,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminRequest())) {
    return { success: false, error: "Không có quyền thêm danh mục." };
  }
  const clean: CategoryInput = {
    slug: c.slug.trim().toLowerCase(),
    label: c.label.trim(),
  };
  const invalid = validateCategoryInput(clean);
  if (invalid) return { success: false, error: invalid };
  if (!postgresConfigured()) {
    return { success: false, error: "Cần kết nối Postgres để thêm danh mục." };
  }
  try {
    const inserted = await insertStoredCategory(clean);
    if (!inserted) {
      return { success: false, error: "Mã danh mục đã tồn tại." };
    }
    revalidateCategoryPages();
    return { success: true };
  } catch (error) {
    console.error("Failed to add category:", error);
    return { success: false, error: "Không thêm được danh mục." };
  }
}

/** Admin-only rename / reorder. The slug itself never changes. */
export async function updateCategory(
  slug: string,
  patch: { label: string; sortOrder: number },
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminRequest())) {
    return { success: false, error: "Không có quyền sửa danh mục." };
  }
  const clean = {
    label: patch.label.trim(),
    sortOrder: patch.sortOrder,
  };
  const invalid = validateCategoryLabel(clean.label);
  if (invalid) return { success: false, error: invalid };
  if (!Number.isInteger(clean.sortOrder)) {
    return { success: false, error: "Thứ tự danh mục chưa đúng." };
  }
  if (!postgresConfigured()) {
    return { success: false, error: "Cần kết nối Postgres để sửa danh mục." };
  }
  try {
    const found = await updateStoredCategory(slug, clean);
    if (!found) {
      return { success: false, error: "Không tìm thấy danh mục." };
    }
    revalidateCategoryPages();
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Không lưu được danh mục." };
  }
}

/**
 * Admin-only delete. Refused while any product uses the category, so
 * the shop never ends up with a product in a category that no longer
 * exists — move those products to another category first.
 */
export async function deleteCategory(
  slug: string,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminRequest())) {
    return { success: false, error: "Không có quyền xóa danh mục." };
  }
  if (!postgresConfigured()) {
    return { success: false, error: "Cần kết nối Postgres để xóa danh mục." };
  }
  try {
    const products = await listStoredProducts(true);
    const inUse = products.filter((p) => p.category === slug).length;
    if (inUse > 0) {
      return {
        success: false,
        error: `Còn ${inUse} sản phẩm đang dùng danh mục này, chuyển chúng sang danh mục khác rồi hãy xóa nhé.`,
      };
    }
    const found = await deleteStoredCategory(slug);
    if (!found) {
      return { success: false, error: "Không tìm thấy danh mục." };
    }
    revalidateCategoryPages();
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Không xóa được danh mục." };
  }
}

function revalidateCategoryPages() {
  revalidatePath("/");
  revalidatePath("/trangchu");
  revalidatePath("/mw-office");
}
