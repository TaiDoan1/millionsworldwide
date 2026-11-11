"use server";

import {
  addCategory as addCategoryService,
  deleteCategory as deleteCategoryService,
  getAllCategories as getAllCategoriesService,
  getCategories as getCategoriesService,
  updateCategory as updateCategoryService,
  type ProductCategory,
} from "../../backend/services/categories";
import type { CategoryInput } from "../../backend/storage/categories";

export type { ProductCategory };
export type { CategoryInput };

/** Live category list (seed fallback without Postgres). */
export async function getCategories() {
  return getCategoriesService();
}

/** Full category list, for /mw-office. */
export async function getAllCategories() {
  return getAllCategoriesService();
}

/** Admin-only category insert (admin check lives in the service). */
export async function addCategory(c: CategoryInput) {
  return addCategoryService(c);
}

/** Admin-only category rename / reorder (admin check lives in the service). */
export async function updateCategory(
  slug: string,
  patch: { label: string; sortOrder: number },
) {
  return updateCategoryService(slug, patch);
}

/** Admin-only category delete (admin check lives in the service). */
export async function deleteCategory(slug: string) {
  return deleteCategoryService(slug);
}
