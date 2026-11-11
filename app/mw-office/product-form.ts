import {
  isLinkedPiece,
  type ProductCategory,
  type ProductPiece,
  type ProductSpec,
  type SizeOption,
} from "../data/products";
import type {
  NewProduct,
  Product,
  ProductPatch,
} from "../actions/products";

/**
 * Shared product-form logic for the admin add/edit forms. Pure helpers
 * only (no JSX): the two forms used to duplicate the same cleaning
 * code, so the payload a form sends is built here, once.
 */

/** The fields the add and edit forms share, as form state. */
export type ProductFormValues = {
  name: string;
  /** Kept as text while typing; converted with Number() on save. */
  price: string;
  compareAt: string;
  category: string;
  soldOut: boolean;
  preOrder: boolean;
  hidden: boolean;
  sizes: SizeOption[];
  pieces: ProductPiece[];
  sizeChart: string;
};

/** Edit form: start from the stored product. */
export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    price: String(product.price),
    compareAt: product.compareAt ? String(product.compareAt) : "",
    category: product.category,
    soldOut: product.soldOut ?? false,
    preOrder: product.preOrder ?? false,
    hidden: product.hidden ?? false,
    sizes: product.sizes ?? [],
    pieces: product.pieces ?? [],
    sizeChart: product.sizeChart ?? "",
  };
}

/** Add form: blank values, category defaults to the first one. */
export function emptyProductFormValues(
  categories: ProductCategory[],
): ProductFormValues {
  return {
    name: "",
    price: "",
    compareAt: "",
    category: categories[0]?.slug ?? "sets",
    soldOut: false,
    preOrder: false,
    hidden: false,
    sizes: [],
    pieces: [],
    sizeChart: "",
  };
}

/** Trim size labels, drop empty rows. */
export function cleanSizes(sizes: SizeOption[]): SizeOption[] {
  return sizes
    .map((s) => ({
      label: s.label.trim(),
      ...(s.soldOut ? { soldOut: true } : {}),
    }))
    .filter((s) => s.label.length > 0);
}

/**
 * Trim piece rows, drop empty ones. Linked pieces keep only the
 * product id; legacy pieces keep id + name + price.
 */
export function cleanPieces(pieces: ProductPiece[]): ProductPiece[] {
  const cleaned: ProductPiece[] = [];
  for (const pc of pieces) {
    if (isLinkedPiece(pc)) {
      const productId = pc.productId.trim();
      if (productId.length > 0) cleaned.push({ productId });
    } else {
      const name = (pc.name ?? "").trim();
      if (name.length > 0) {
        cleaned.push({
          id: (pc.id ?? "").trim().toLowerCase(),
          name,
          price: pc.price,
        });
      }
    }
  }
  return cleaned;
}

/** Spec fields: null when every field is blank. */
export function cleanSpec(fields: {
  material: string;
  fit: string;
  stretch: string;
  model: string;
}): ProductSpec | null {
  const material = fields.material.trim();
  const fit = fields.fit.trim();
  const stretch = fields.stretch.trim();
  const model = fields.model.trim();
  if (!material && !fit && !stretch && !model) return null;
  return {
    ...(material ? { material } : {}),
    ...(fit ? { fit } : {}),
    ...(stretch ? { stretch } : {}),
    ...(model ? { model } : {}),
  };
}

/** Size-chart path: null when blank. */
export function cleanSizeChart(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

/** Edit form: values + spec fields + image list → update payload. */
export function buildProductPatch(
  values: ProductFormValues,
  spec: { material: string; fit: string; stretch: string; model: string },
  images: string[],
): ProductPatch {
  return {
    name: values.name,
    price: Number(values.price),
    compareAt:
      values.compareAt.trim() === "" ? null : Number(values.compareAt),
    category: values.category,
    soldOut: values.soldOut,
    preOrder: values.preOrder,
    hidden: values.hidden,
    sizes: cleanSizes(values.sizes),
    spec: cleanSpec(spec),
    pieces: cleanPieces(values.pieces),
    sizeChart: cleanSizeChart(values.sizeChart),
    images,
  };
}

/** Add form: values + id + image list → create payload. */
export function buildNewProduct(
  values: ProductFormValues,
  id: string,
  images: string[],
): NewProduct {
  return {
    id,
    name: values.name,
    price: Number(values.price),
    compareAt:
      values.compareAt.trim() === "" ? null : Number(values.compareAt),
    category: values.category,
    soldOut: values.soldOut,
    preOrder: values.preOrder,
    hidden: values.hidden,
    images,
    sizes: cleanSizes(values.sizes),
    spec: null,
    pieces: cleanPieces(values.pieces),
    sizeChart: cleanSizeChart(values.sizeChart),
  };
}
