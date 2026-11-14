import { isLinkedPiece, type Product } from "../../data/products";

/** One resolved piece row: a linked standalone product, or a legacy inline piece. */
export type PieceRow =
  | { kind: "linked"; product: Product; price: number }
  | { kind: "legacy"; id: string; name: string; price: number };

export function rowKey(row: PieceRow): string {
  return row.kind === "linked" ? row.product.id : row.id;
}

/**
 * Gallery images for a selection: a single linked piece shows its own
 * photos; anything else (nothing picked, the full set, a partial
 * multi-piece pick, or a legacy piece with no photos of its own)
 * shows the set's photos.
 */
export function galleryImagesFor(
  set: Product,
  rows: PieceRow[],
  selectedKeys: string[],
): string[] {
  if (selectedKeys.length === 1) {
    const row = rows.find((r) => rowKey(r) === selectedKeys[0]);
    if (row?.kind === "linked" && row.product.images.length > 0) {
      return row.product.images;
    }
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
      });
    }
  }
  return rows;
}
