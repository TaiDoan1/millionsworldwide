/**
 * Pure product validation — no Next.js imports, so it can be unit-tested
 * outside the app. Returns an error message, or null when the data is
 * safe to persist. Prices are in thousands of VND, as everywhere.
 */
import { isLinkedPiece } from "../../app/data/products";
import type { ProductPatch, NewProduct } from "../storage/products";
import type {
  ProductColor,
  ProductPiece,
  ProductSpec,
  SizeOption,
} from "../../app/data/products";

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
  // The category must be a well-formed slug; whether it exists in the
  // live category list is checked in the service, which can read the DB.
  if (
    typeof p.category !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.category) ||
    p.category.length === 0 ||
    p.category.length > 50
  ) {
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
  const colorsError = validateColors(p.colors ?? []);
  if (colorsError) return colorsError;
  const specError = validateSpec(p.spec);
  if (specError) return specError;
  const piecesError = validatePieces(p.pieces ?? []);
  if (piecesError) return piecesError;
  const imagesError = validateImages(p.images ?? []);
  if (imagesError) return imagesError;
  const sizeChartError = validateSizeChart(p.sizeChart ?? null);
  if (sizeChartError) return sizeChartError;
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

export function validateColors(colors: ProductColor[]): string | null {
  if (!Array.isArray(colors) || colors.length > 10) {
    return "Danh sách màu tối đa 10 mục.";
  }
  const seen = new Set<string>();
  for (const c of colors) {
    if (
      !c ||
      typeof c.label !== "string" ||
      c.label.trim().length === 0 ||
      c.label.trim().length > 20
    ) {
      return "Mỗi màu phải từ 1 đến 20 ký tự.";
    }
    if (c.label.includes(":")) {
      return "Tên màu không dùng dấu hai chấm.";
    }
    if (
      c.hex !== undefined &&
      (typeof c.hex !== "string" || !/^#[0-9a-fA-F]{6}$/.test(c.hex))
    ) {
      return "Mã màu phải có dạng #RRGGBB, ví dụ #111111.";
    }
    if (c.soldOut !== undefined && typeof c.soldOut !== "boolean") {
      return "Trạng thái hết hàng của màu chưa đúng.";
    }
    const imagesError = validateImages(c.images ?? []);
    if (imagesError) return `Ảnh của màu ${c.label.trim()}: ${imagesError}`;
    const label = c.label.trim().toLowerCase();
    if (seen.has(label)) return `Màu ${c.label.trim()} bị trùng.`;
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

/**
 * Gallery paths: each must be an absolute path inside the web
 * ("/products/<file>" shipped with the code, or "/uploads/<file>"
 * uploaded from /mw-office) with no parent-directory escape.
 * Whether a file actually sits behind the path is checked in the
 * service, which can read the disk.
 */
export function validateImages(images: string[]): string | null {
  if (!Array.isArray(images) || images.length > 20) {
    return "Mỗi sản phẩm tối đa 20 ảnh.";
  }
  for (const src of images) {
    if (
      typeof src !== "string" ||
      !src.startsWith("/") ||
      src.includes("..")
    ) {
      return `Đường dẫn ảnh chưa đúng: ${src}`;
    }
  }
  return null;
}

/**
 * Size-chart photo: empty (no chart) or a single image path inside the
 * web ("/products/<file>" shipped with the code, or "/uploads/<file>"
 * uploaded from /mw-office) with no parent-directory escape. Whether a
 * file actually sits behind the path is checked in the service, which
 * can read the disk.
 */
export function validateSizeChart(sizeChart: string | null): string | null {
  if (sizeChart === null || sizeChart === undefined || sizeChart === "") {
    return null;
  }
  if (
    typeof sizeChart !== "string" ||
    !sizeChart.startsWith("/") ||
    sizeChart.includes("..")
  ) {
    return `Đường dẫn ảnh bảng size chưa đúng: ${sizeChart}`;
  }
  return null;
}

/**
 * Pieces of a set ("giá lẻ"). A piece is normally a LINK to a
 * standalone product ({productId}) — its name/price/sizes/stock come
 * from that product. Legacy inline pieces ({id, name, price}) are
 * still validated by the old rules. Whether a linked product exists
 * (and isn't the set itself) is checked in the service, which can
 * read the catalog.
 */
export function validatePieces(pieces: ProductPiece[]): string | null {
  if (!Array.isArray(pieces) || pieces.length > 10) {
    return "Mỗi sản phẩm tối đa 10 món lẻ.";
  }
  const seenIds = new Set<string>();
  const seenLinks = new Set<string>();
  for (const pc of pieces) {
    if (!pc || typeof pc !== "object") return "Món lẻ chưa đúng.";
    if (isLinkedPiece(pc)) {
      if (seenLinks.has(pc.productId)) {
        return "Một sản phẩm chỉ link một lần trong set.";
      }
      seenLinks.add(pc.productId);
      continue;
    }
    if (
      typeof pc.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pc.id) ||
      pc.id.length < 3 ||
      pc.id.length > 50
    ) {
      return "Mã món lẻ chỉ gồm chữ thường, số và dấu gạch ngang, từ 3 đến 50 ký tự.";
    }
    if (
      typeof pc.name !== "string" ||
      pc.name.trim().length === 0 ||
      pc.name.trim().length > 100
    ) {
      return "Tên món lẻ phải từ 1 đến 100 ký tự.";
    }
    const price = pc.price;
    if (
      typeof price !== "number" ||
      !Number.isInteger(price) ||
      price < 1 ||
      price > 100000
    ) {
      return "Giá lẻ phải là số nguyên từ 1 đến 100.000 (nghìn đồng).";
    }
    if (seenIds.has(pc.id)) return `Mã món lẻ ${pc.id} bị trùng.`;
    seenIds.add(pc.id);
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
