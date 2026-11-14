/**
 * A product category: a URL-safe slug + the display label. The shop
 * ships with 5 (SEED_CATEGORIES below); the owner manages the live list
 * in /mw-office, stored in the Postgres `categories` table. A product
 * stores only the slug (Product.category is a plain string).
 */
export type ProductCategory = {
  slug: string;
  label: string;
};

/** One size of a product. Only sizes listed here with soldOut: true are
 *  locked — anything not listed is treated as available, never invented
 *  as a stock number. */
export type SizeOption = {
  label: string;
  soldOut?: boolean;
};

/**
 * One color of a product. `hex` drives the swatch dot on the detail
 * page; `images` are this color's own photos — picking the color swaps
 * the gallery to them (empty means the product's photos). Only colors
 * listed here are offered, never invented.
 */
export type ProductColor = {
  label: string;
  /** Swatch colour, e.g. "#111111". */
  hex?: string;
  soldOut?: boolean;
  images?: string[];
};

/** Short spec facts. Every field is optional on purpose: the detail page
 *  only renders the rows that are actually filled in, so no material,
 *  fit or model info is ever invented for a product that has none. */
export type ProductSpec = {
  material?: string;
  fit?: string;
  stretch?: string;
  /** e.g. model height / weight / size worn — only when the shop supplies it. */
  model?: string;
};

/**
 * One piece of a set. Since 2026-11-10 a piece is a LINK to a standalone
 * product: its name/price/sizes/stock all come from that product, so the
 * set page and the product's own page never disagree. The older inline
 * shape {id, name, price} is still read (sets saved before linking
 * existed) but the admin only writes links now.
 */
export type ProductPiece = {
  /** Link to a standalone product (the normal case). */
  productId?: string;
  /** Legacy inline piece: its own id/name/price. */
  id?: string;
  name?: string;
  price?: number;
};

/** True when the piece links to a standalone product. */
export function isLinkedPiece(
  pc: ProductPiece,
): pc is ProductPiece & { productId: string } {
  return typeof pc.productId === "string" && pc.productId.length > 0;
}

export type Product = {
  id: string;
  name: string;
  price: number;
  /** Category slug — must exist in the live categories list. */
  category: string;
  /** Gallery — the arrows on a product card cycle through these images. */
  images: string[];
  soldOut?: boolean;
  preOrder?: boolean;
  /** Original price — set to show a "save" badge. */
  compareAt?: number;
  /** Per-size availability, in one place (this file). When absent, no size
   *  picker is shown at all — the shop confirms size by phone, as before.
   *  Add the shop's real size list here and the detail page will show a
   *  picker with sold-out sizes locked. Never invent a size list. */
  sizes?: SizeOption[];
  /**
   * Per-color options with their own photos, in one place (this file).
   * When absent, no color picker is shown at all — the product is sold
   * in its gallery photos as before. Add the shop's real colors here
   * and the detail page will show a picker; picking a color with
   * photos swaps the gallery to them. Never invent a color list.
   */
  colors?: ProductColor[];
  /** Spec facts for the detail page; omitted rows are simply not shown. */
  spec?: ProductSpec;
  /**
   * Pieces of a set, buyable one by one at their own ("lẻ") prices.
   * When absent or empty, the detail page shows no "Mua lẻ" section —
   * the set is only sold as a whole. Pieces inherit the set's sizes
   * and its sold-out state; they are edited in /mw-office, never
   * invented here.
   */
  pieces?: ProductPiece[];
  /**
   * Size-chart photo ("/uploads/..." or "/products/..."), uploaded from
   * /mw-office. When set, the detail page shows a "Bảng size" button
   * next to the size picker. Absent until the shop uploads one — never
   * invented here.
   */
  sizeChart?: string;
  /**
   * Hidden from the shop AND unbuyable (admin-only flag, stored in the
   * Postgres catalog — the code seed never sets it). Sold-out products
   * stay visible with a badge; hidden ones disappear entirely.
   */
  hidden?: boolean;
};

/** Effective size options for a product: its own list, or none. */
export function sizeOptionsFor(product: Product): SizeOption[] {
  return product.sizes ?? [];
}

/** True when this size is locked for this product. */
export function isSizeSoldOut(product: Product, label: string): boolean {
  return product.sizes?.some((s) => s.label === label && s.soldOut) ?? false;
}

/** Effective color options for a product: its own list, or none. */
export function colorOptionsFor(product: Product): ProductColor[] {
  return product.colors ?? [];
}

/** True when this color is locked for this product. */
export function isColorSoldOut(product: Product, label: string): boolean {
  return product.colors?.some((c) => c.label === label && c.soldOut) ?? false;
}

/**
 * This color's own photos, when the shop supplied any — otherwise null
 * and the caller keeps the product's photos.
 */
export function colorImages(product: Product, label: string): string[] | null {
  const images = product.colors?.find((c) => c.label === label)?.images ?? [];
  return images.length > 0 ? images : null;
}

/** Find a piece anywhere in the catalog: its parent set + the piece.
 *  A linked piece is found by the standalone product's id; a legacy
 *  inline piece by its own id. */
export function findPiece(
  catalog: Product[],
  pieceId: string,
): { set: Product; piece: ProductPiece } | null {
  for (const set of catalog) {
    const piece = (set.pieces ?? []).find((pc) =>
      isLinkedPiece(pc) ? pc.productId === pieceId : pc.id === pieceId,
    );
    if (piece) return { set, piece };
  }
  return null;
}

/**
 * The cart/order view of a piece. A linked piece IS its standalone
 * product (same name/price/sizes/stock — one source of truth). A legacy
 * inline piece becomes a synthetic product carrying its own id/name/
 * price with the set's images/sizes/stock. Returns null when a linked
 * product is gone from the catalog, or a legacy piece is malformed.
 */
export function pieceToProduct(
  set: Product,
  piece: ProductPiece,
  catalog: Product[],
): Product | null {
  if (isLinkedPiece(piece)) {
    return catalog.find((p) => p.id === piece.productId) ?? null;
  }
  if (
    typeof piece.id !== "string" ||
    typeof piece.name !== "string" ||
    typeof piece.price !== "number"
  ) {
    return null;
  }
  return {
    id: piece.id,
    name: `${set.name} — ${piece.name}`,
    price: piece.price,
    category: set.category,
    images: set.images,
    soldOut: set.soldOut,
    preOrder: set.preOrder,
    ...(set.sizes ? { sizes: set.sizes } : {}),
    ...(set.colors ? { colors: set.colors } : {}),
  };
}

/** Seed categories: the starting list, copied into the `categories`
 *  table on first run and used as the read-only fallback without
 *  Postgres. The live list is managed in /mw-office. */
export const SEED_CATEGORIES: ProductCategory[] = [
  { slug: "sets", label: "Sets" },
  { slug: "t-shirts", label: "T-Shirts" },
  { slug: "shirts", label: "Shirts" },
  { slug: "jeans", label: "Jeans" },
  { slug: "shorts", label: "Shorts" },
];

/**
 * Catalog rebuilt 2026-10-22 from the "Tách Nền Millions" lookbook shoot
 * (background-removed model photos from Google Drive).
 * Prices are in thousands of VND and are drafts for the owner to confirm.
 *
 * This array is the SEED + read-only fallback, not the live catalog: when
 * Postgres is configured, backend/storage/products.ts copies it into the
 * products table on first run, and the shop reads the table from then on
 * (so /mw-office edits apply without a code push). Keep the ids stable —
 * they are the product URLs (/trangchu/<id>).
 */
export const PRODUCTS: Product[] = [
  // sets
  {
    id: "set-hoodie-black",
    name: "black hoodie set",
    price: 890,
    category: "sets",
    images: [
      "/products/set-hoodie-black-1.jpg",
      "/products/set-hoodie-black-2.jpg",
      "/products/set-hoodie-black-3.jpg",
      "/products/set-hoodie-black-4.jpg",
      "/products/set-hoodie-black-5.jpg",
    ],
  },
  {
    id: "set-hoodie-grey",
    name: "grey hoodie set",
    price: 890,
    category: "sets",
    images: [
      "/products/set-hoodie-grey-1.jpg",
      "/products/set-hoodie-grey-2.jpg",
      "/products/set-hoodie-grey-3.jpg",
      "/products/set-hoodie-grey-4.jpg",
    ],
  },
  {
    id: "set-denim-dark",
    name: "dark denim set",
    price: 990,
    category: "sets",
    images: [
      "/products/set-denim-dark-1.jpg",
      "/products/set-denim-dark-2.jpg",
      "/products/set-denim-dark-3.jpg",
      "/products/set-denim-dark-4.jpg",
    ],
  },
  {
    id: "set-jeans-signature",
    name: "signature denim set",
    price: 1190,
    category: "sets",
    images: [
      "/products/set-jeans-signature-1.jpg",
      "/products/set-jeans-signature-2.jpg",
      "/products/set-jeans-signature-3.jpg",
      "/products/set-jeans-signature-4.jpg",
      "/products/set-jeans-signature-5.jpg",
    ],
  },

  // t-shirts
  {
    id: "tee-millions",
    name: "millions worldwide tee",
    price: 350,
    category: "t-shirts",
    images: [
      "/products/tee-millions-1.jpg",
      "/products/tee-millions-2.jpg",
      "/products/tee-millions-3.jpg",
      "/products/tee-millions-4.jpg",
      "/products/tee-millions-5.jpg",
    ],
  },
  {
    id: "tee-ruthless",
    name: "ruthless club tee",
    price: 350,
    category: "t-shirts",
    images: [
      "/products/tee-ruthless-1.jpg",
      "/products/tee-ruthless-2.jpg",
      "/products/tee-ruthless-3.jpg",
    ],
  },
  {
    id: "tee-white",
    name: "white logo tee",
    price: 320,
    category: "t-shirts",
    images: [
      "/products/tee-white-1.jpg",
      "/products/tee-white-2.jpg",
      "/products/tee-white-3.jpg",
      "/products/tee-white-4.jpg",
      "/products/tee-white-5.jpg",
    ],
  },
  {
    id: "tee-yellow-ls",
    name: "yellow long sleeve tee",
    price: 380,
    category: "t-shirts",
    images: [
      "/products/tee-yellow-ls-1.jpg",
      "/products/tee-yellow-ls-2.jpg",
      "/products/tee-yellow-ls-3.jpg",
      "/products/tee-yellow-ls-4.jpg",
    ],
  },
  {
    id: "tank-black",
    name: "black ribbed tank",
    price: 250,
    category: "t-shirts",
    images: [
      "/products/tank-black-1.jpg",
      "/products/tank-black-2.jpg",
      "/products/tank-black-3.jpg",
      "/products/tank-black-4.jpg",
      "/products/tank-black-5.jpg",
    ],
  },

  // shirts
  {
    id: "shirt-white",
    name: "white oxford shirt",
    price: 450,
    category: "shirts",
    images: [
      "/products/shirt-white-1.jpg",
      "/products/shirt-white-2.jpg",
      "/products/shirt-white-3.jpg",
      "/products/shirt-white-4.jpg",
      "/products/shirt-white-5.jpg",
    ],
  },
  {
    id: "jacket-black",
    name: "black stitch jacket",
    price: 690,
    category: "shirts",
    images: [
      "/products/jacket-black-1.jpg",
      "/products/jacket-black-2.jpg",
      "/products/jacket-black-3.jpg",
      "/products/jacket-black-4.jpg",
    ],
  },
  {
    id: "raglan-la",
    name: "los angeles raglan",
    price: 380,
    category: "shirts",
    images: [
      "/products/raglan-la-1.jpg",
      "/products/raglan-la-2.jpg",
      "/products/raglan-la-3.jpg",
      "/products/raglan-la-4.jpg",
    ],
  },

  // jeans
  {
    id: "jeans-wide",
    name: "wide leg jeans",
    price: 590,
    category: "jeans",
    images: [
      "/products/jeans-wide-1.jpg",
      "/products/jeans-wide-2.jpg",
      "/products/jeans-wide-3.jpg",
      "/products/jeans-wide-4.jpg",
      "/products/jeans-wide-5.jpg",
      "/products/jeans-wide-6.jpg",
    ],
  },
  {
    id: "jeans-washed",
    name: "washed wide leg jeans",
    price: 590,
    category: "jeans",
    images: ["/products/jeans-washed-1.jpg", "/products/jeans-washed-2.jpg"],
  },

  // shorts
  {
    id: "shorts-denim",
    name: "denim shorts",
    price: 390,
    category: "shorts",
    images: [
      "/products/shorts-denim-1.jpg",
      "/products/shorts-denim-2.jpg",
      "/products/shorts-denim-3.jpg",
      "/products/shorts-denim-4.jpg",
    ],
  },
  {
    id: "shorts-cargo",
    name: "cargo shorts",
    price: 390,
    category: "shorts",
    images: [
      "/products/shorts-cargo-1.jpg",
      "/products/shorts-cargo-2.jpg",
      "/products/shorts-cargo-3.jpg",
    ],
  },
  {
    id: "shorts-sweat",
    name: "sweat shorts",
    price: 320,
    category: "shorts",
    images: [
      "/products/shorts-sweat-1.jpg",
      "/products/shorts-sweat-2.jpg",
      "/products/shorts-sweat-3.jpg",
    ],
  },
];
