"use server";

import {
  addProduct as addProductService,
  deleteProduct as deleteProductService,
  getAllProducts as getAllProductsService,
  getProductById as getProductByIdService,
  getProducts as getProductsService,
  updateProduct as updateProductService,
  type NewProduct,
  type ProductPatch,
} from "../../backend/services/products";

export type { Product } from "../../backend/services/products";
export type { NewProduct, ProductPatch } from "../../backend/services/products";

/** Live shop catalog (visible products only). */
export async function getProducts() {
  return getProductsService();
}

/** One visible product for the detail page. */
export async function getProductById(id: string) {
  return getProductByIdService(id);
}

/** Full catalog including hidden items, for /mw-office. */
export async function getAllProducts() {
  return getAllProductsService();
}

/** Admin-only product edit (admin check lives in the service). */
export async function updateProduct(id: string, patch: ProductPatch) {
  return updateProductService(id, patch);
}

/** Admin-only product insert (admin check lives in the service). */
export async function addProduct(p: NewProduct) {
  return addProductService(p);
}

/** Admin-only product delete (admin check lives in the service). */
export async function deleteProduct(id: string) {
  return deleteProductService(id);
}
