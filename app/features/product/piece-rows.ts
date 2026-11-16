import { isLinkedPiece, type Product } from "../../data/products";

/** One resolved piece row: a linked standalone product, or an inline
 *  piece with its own name/price/photos. */
export type PieceRow =
  | { kind: "linked"; product: Product; price: number }
  | { kind: "legacy"; id: string; name: string; price: number; images: string[] };

export function rowKey(row: PieceRow): string {
  return row.kind === "linked" ? row.product.id : row.id;
}

/**
 * Gallery images for a selection: a single piece shows its own photos
 * (the linked product's, or the inline piece's own list); a picked
 * color with its own photos comes next; anything else (nothing picked,
 * the full set, a partial multi-piece pick, or a piece with no photos
 * of its own) shows the set's photos.
 */
export function galleryImagesFor(
  set: Product,
  rows: PieceRow[],
  selectedKeys: string[],
  colorImages?: string[] | null,
): string[] {
  if (selectedKeys.length === 1) {
    const row = rows.find((r) => rowKey(r) === selectedKeys[0]);
    const images =
      row?.kind === "linked"
        ? row.product.images
        : (row?.kind === "legacy" ? row.images : undefined) ?? [];
    if (images.length > 0) {
      return images;
    }
  }
  if (colorImages && colorImages.length > 0) {
    return colorImages;
  }
  return set.images;
}

export function rowName(row: PieceRow): string {
  return row.kind === "linked" ? row.product.name : row.name;
}

export function rowSoldOut(row: PieceRow, set: Product): boolean {
  return row.kind === "linked" ? !!row.product.soldOut : !!set.soldOut;
}

/** The product id that goes into the cart for this row. */
export function rowProductId(row: PieceRow): string {
  return row.kind === "linked" ? row.product.id : row.id;
}

/**
 * Resolve a set's pieces against the live catalog. Linked pieces whose
 * product is gone or hidden are skipped; legacy inline pieces (saved
 * before linking) pass through with the set's sizes.
 */
export function resolveRows(set: Product, catalog: Product[]): PieceRow[] {
  const rows: PieceRow[] = [];
  for (const piece of set.pieces ?? []) {
    if (isLinkedPiece(piece)) {
      const linked = catalog.find((p) => p.id === piece.productId);
      if (linked) {
        rows.push({ kind: "linked", product: linked, price: linked.price });
      }
      // Gone or hidden from the visible catalog: skip the row.
    } else if (
      typeof piece.id === "string" &&
      typeof piece.name === "string" &&
      typeof piece.price === "number"
    ) {
      rows.push({
        kind: "legacy",
        id: piece.id,
        name: piece.name,
        price: piece.price,
        images: piece.images ?? [],
      });
    }
  }
  return rows;
}
