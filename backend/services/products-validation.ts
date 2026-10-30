/**
 * Pure product validation — no Next.js imports, so it can be unit-tested
 * outside the app. Returns an error message, or null when the data is
 * safe to persist. Prices are in thousands of VND, as everywhere.
 */
import { CATEGORIES } from "../../app/data/products";
import type { ProductPatch, NewProduct } from "../storage/products";
import type { ProductSpec, SizeOption } from "../../app/data/products";

export function validateProductPatch(p: ProductPatch): string | null {
  if (
    typeof p.name !== "string" ||
    p.name.trim().length === 0 ||
    p.name.trim().length > 100
  ) {
    return "Tên sản phẩm phải từ 1 đến 100 ký tự.";
  }
  if (!Number.isInteger(p.price) || p.price < 1 || p.price > 100000) {
    return "Giá phải là số nguyên từ 1 đến 100.000 (nghìn đồng).";
  }
  if (
    p.compareAt !== null &&
    p.compareAt !== undefined &&
    (!Number.isInteger(p.compareAt) || p.compareAt < 1 || p.compareAt > 100000)
  ) {
    return "Giá gốc phải là số nguyên từ 1 đến 100.000 (nghìn đồng), hoặc để trống.";
  }
  if (!CATEGORIES.includes(p.category)) {
    return "Danh mục chưa đúng.";
  }
  if (
    typeof p.soldOut !== "boolean" ||
    typeof p.preOrder !== "boolean" ||
    typeof p.hidden !== "boolean"
  ) {
    return "Trạng thái sản phẩm chưa đúng.";
  }
  const sizesError = validateSizes(p.sizes ?? []);
  if (sizesError) return sizesError;
  const specError = validateSpec(p.spec);
  if (specError) return specError;
  return null;
}

export function validateSizes(sizes: SizeOption[]): string | null {
  if (!Array.isArray(sizes) || sizes.length > 20) {
    return "Danh sách size tối đa 20 mục.";
  }
  const seen = new Set<string>();
  for (const s of sizes) {
    if (
      !s ||
      typeof s.label !== "string" ||
      s.label.trim().length === 0 ||
      s.label.trim().length > 10
    ) {
      return "Mỗi size phải từ 1 đến 10 ký tự.";
    }
    if (s.soldOut !== undefined && typeof s.soldOut !== "boolean") {
      return "Trạng thái hết hàng của size chưa đúng.";
    }
    const label = s.label.trim();
    if (seen.has(label)) return `Size ${label} bị trùng.`;
    seen.add(label);
  }
  return null;
}

export function validateSpec(spec: ProductSpec | null): string | null {
  if (spec === null || spec === undefined) return null;
  if (typeof spec !== "object" || Array.isArray(spec)) {
    return "Thông số sản phẩm chưa đúng.";
  }
  for (const key of ["material", "fit", "stretch", "model"] as const) {
    const value = spec[key];
    if (
      value !== undefined &&
      (typeof value !== "string" || value.length > 200)
    ) {
      return "Mỗi mục thông số tối đa 200 ký tự.";
    }
  }
  return null;
}

export function validateNewProduct(p: NewProduct): string | null {
  if (
    typeof p.id !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id) ||
    p.id.length < 3 ||
    p.id.length > 50
  ) {
    return "Mã sản phẩm chỉ gồm chữ thường, số và dấu gạch ngang, từ 3 đến 50 ký tự (ví dụ: tee-millions-2).";
  }
  const patchError = validateProductPatch(p);
  if (patchError) return patchError;
  if (!Array.isArray(p.images) || p.images.length === 0) {
    return "Sản phẩm mới cần ít nhất 1 ảnh.";
  }
  for (const src of p.images) {
    if (typeof src !== "string" || !src.startsWith("/") || src.includes("..")) {
      return `Đường dẫn ảnh chưa đúng: ${src}`;
    }
  }
  return null;
}
