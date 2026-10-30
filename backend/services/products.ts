/**
 * Backend service: product catalog. Called only via app/actions/products.ts.
 *
 * Two read modes, on purpose:
 * - Display (getProducts / getProductById): Postgres when configured, the
 *   code seed otherwise; a DB error falls back to the seed so browsing
 *   stays open — the same fail-open rule as the Coming Soon gate.
 * - Pricing (getProductsStrict): same list, but a DB error THROWS — an
 *   order must never be priced from stale seed data while the live
 *   catalog is unreachable.
 * Hidden products are absent from both lists, so hiding a product also
 * makes it unbuyable; sold-out products stay listed so checkout can
 * reject them with the sold-out message instead of "not found".
 */
import { revalidatePath } from "next/cache";
import fs from "node:fs";
import path from "node:path";
import { PRODUCTS, type Product } from "../../app/data/products";
import { postgresConfigured } from "../storage/postgres";
import {
  deleteProduct as deleteStoredProduct,
  getProduct as getStoredProduct,
  insertProduct as insertStoredProduct,
  listProducts as listStoredProducts,
  updateProduct as updateStoredProduct,
  type NewProduct,
  type ProductPatch,
} from "../storage/products";
import { isAdminRequest } from "../auth/admin-auth";
import {
  validateNewProduct,
  validateProductPatch,
} from "./products-validation";

export type { Product } from "../../app/data/products";
export type { NewProduct, ProductPatch } from "../storage/products";

const visibleSeed = (): Product[] => PRODUCTS.filter((p) => !p.hidden);

const seedProductById = (id: string): Product | null =>
  PRODUCTS.find((p) => p.id === id && !p.hidden) ?? null;

export async function getProducts(): Promise<Product[]> {
  if (!postgresConfigured()) return visibleSeed();
  try {
    return await listStoredProducts(false);
  } catch (error) {
    console.error("Failed to read products, falling back to seed:", error);
    return visibleSeed();
  }
}

export async function getProductsStrict(): Promise<Product[]> {
  if (!postgresConfigured()) return visibleSeed();
  return listStoredProducts(false);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!postgresConfigured()) return seedProductById(id);
  try {
    return await getStoredProduct(id);
  } catch (error) {
    console.error("Failed to read product, falling back to seed:", error);
    return seedProductById(id);
  }
}

/** Full catalog including hidden items, for /mw-office. */
export async function getAllProducts(): Promise<Product[]> {
  if (!postgresConfigured()) {
    throw new Error("Cần kết nối Postgres để quản lý sản phẩm.");
  }
  return listStoredProducts(true);
}

export async function updateProduct(
  id: string,
  patch: ProductPatch,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminRequest())) {
    return { success: false, error: "Không có quyền thay đổi sản phẩm." };
  }
  const clean: ProductPatch = {
    name: patch.name.trim(),
    price: patch.price,
    compareAt: patch.compareAt ?? null,
    category: patch.category,
    soldOut: patch.soldOut,
    preOrder: patch.preOrder,
    hidden: patch.hidden,
    sizes: (patch.sizes ?? [])
      .map((s) => ({
        label: s.label.trim(),
        ...(s.soldOut ? { soldOut: true } : {}),
      }))
      .filter((s) => s.label.length > 0),
    spec: cleanSpec(patch.spec),
  };
  const invalid = validateProductPatch(clean);
  if (invalid) return { success: false, error: invalid };
  if (!postgresConfigured()) {
    return { success: false, error: "Cần kết nối Postgres để sửa sản phẩm." };
  }
  try {
    const found = await updateStoredProduct(id, clean);
    if (!found) return { success: false, error: "Không tìm thấy sản phẩm." };
    revalidateProductPages(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Không lưu được sản phẩm." };
  }
}

/** Admin-only insert. Image paths must already exist under public/. */
export async function addProduct(
  p: NewProduct,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminRequest())) {
    return { success: false, error: "Không có quyền thêm sản phẩm." };
  }
  const clean: NewProduct = {
    id: p.id.trim().toLowerCase(),
    name: p.name.trim(),
    price: p.price,
    compareAt: p.compareAt ?? null,
    category: p.category,
    soldOut: p.soldOut,
    preOrder: p.preOrder,
    hidden: p.hidden,
    images: (p.images ?? []).map((s) => s.trim()).filter((s) => s.length > 0),
    sizes: (p.sizes ?? [])
      .map((s) => ({
        label: s.label.trim(),
        ...(s.soldOut ? { soldOut: true } : {}),
      }))
      .filter((s) => s.label.length > 0),
    spec: cleanSpec(p.spec),
  };
  const invalid = validateNewProduct(clean);
  if (invalid) return { success: false, error: invalid };
  if (!postgresConfigured()) {
    return { success: false, error: "Cần kết nối Postgres để thêm sản phẩm." };
  }
  // Images are served from public/ — a path with no file behind it would
  // render a broken card, so the save is refused up front.
  for (const src of clean.images) {
    if (!/\.(jpe?g|png|webp)$/i.test(src)) {
      return { success: false, error: `Ảnh phải là file jpg, png hoặc webp: ${src}` };
    }
    if (!fs.existsSync(path.join(process.cwd(), "public", src))) {
      return { success: false, error: `Không tìm thấy file ảnh trong web: ${src}` };
    }
  }
  try {
    const inserted = await insertStoredProduct(clean);
    if (!inserted) {
      return { success: false, error: "Mã sản phẩm đã tồn tại." };
    }
    revalidateProductPages(clean.id);
    return { success: true };
  } catch (error) {
    console.error("Failed to add product:", error);
    return { success: false, error: "Không thêm được sản phẩm." };
  }
}

/** Admin-only hard delete (past orders keep their own snapshots). */
export async function deleteProduct(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminRequest())) {
    return { success: false, error: "Không có quyền xóa sản phẩm." };
  }
  if (!postgresConfigured()) {
    return { success: false, error: "Cần kết nối Postgres để xóa sản phẩm." };
  }
  try {
    const found = await deleteStoredProduct(id);
    if (!found) return { success: false, error: "Không tìm thấy sản phẩm." };
    revalidateProductPages(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Không xóa được sản phẩm." };
  }
}

function cleanSpec(
  spec: ProductPatch["spec"],
): ProductPatch["spec"] {
  if (!spec) return null;
  const clean: NonNullable<ProductPatch["spec"]> = {};
  for (const key of ["material", "fit", "stretch", "model"] as const) {
    const value = spec[key];
    if (typeof value === "string" && value.trim().length > 0) {
      clean[key] = value.trim();
    }
  }
  return Object.keys(clean).length > 0 ? clean : null;
}

function revalidateProductPages(id: string) {
  revalidatePath("/");
  revalidatePath("/trangchu");
  revalidatePath(`/trangchu/${id}`);
  revalidatePath("/mw-office");
}
