/**
 * Pure category validation — no Next.js imports, so it can be unit-tested
 * outside the app.
 */
import type { CategoryInput } from "../storage/categories";

/** Slugs are URL-safe lowercase words joined by dashes. */
export const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateCategoryInput(c: CategoryInput): string | null {
  if (
    typeof c.slug !== "string" ||
    !CATEGORY_SLUG_PATTERN.test(c.slug) ||
    c.slug.length > 50
  ) {
    return "Mã danh mục chỉ gồm chữ thường, số và dấu gạch ngang, tối đa 50 ký tự (ví dụ: hoodies).";
  }
  if (
    typeof c.label !== "string" ||
    c.label.trim().length === 0 ||
    c.label.trim().length > 50
  ) {
    return "Tên danh mục phải từ 1 đến 50 ký tự.";
  }
  return null;
}

export function validateCategoryLabel(label: string): string | null {
  if (
    typeof label !== "string" ||
    label.trim().length === 0 ||
    label.trim().length > 50
  ) {
    return "Tên danh mục phải từ 1 đến 50 ký tự.";
  }
  return null;
}
