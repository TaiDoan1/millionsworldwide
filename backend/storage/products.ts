/**
 * Postgres-backed product catalog.
 *
 * The 17 products used to live only in app/data/products.ts (code). That
 * file is now the SEED + read-only fallback: on first run with an empty
 * products table, the seed is copied in (in seed order), and from then on
 * the table is the live catalog — /mw-office edits it, the shop reads it.
 *
 * Deliberately Postgres-only (no SQLite/file branch): product editing is
 * an admin feature of the Postgres deployment. Without DATABASE_URL the
 * service layer falls back to the code seed for display, and admin edits
 * are refused with a clear message instead of writing to a second store.
 */
import {
  PRODUCTS,
  type Product,
  type ProductSpec,
  type SizeOption,
} from "../../app/data/products";
import { getPostgresPool } from "./postgres";

/** Fields /mw-office may change. Images stay code-owned on edit; the add
 *  form supplies them as text paths that must already exist in public/. */
export type ProductPatch = {
  name: string;
  price: number;
  compareAt: number | null;
  category: Product["category"];
  soldOut: boolean;
  preOrder: boolean;
  hidden: boolean;
  sizes: SizeOption[];
  spec: ProductSpec | null;
};

/** Full row for a brand-new product (id chosen in /mw-office). */
export type NewProduct = ProductPatch & {
  id: string;
  images: string[];
};

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function asStringArray(value: unknown): string[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? safeParse(value)
      : undefined;
  if (!Array.isArray(list)) return [];
  return list.filter((x): x is string => typeof x === "string");
}

function asSizeOptions(value: unknown): SizeOption[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? safeParse(value)
      : undefined;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (s): s is SizeOption =>
      !!s && typeof s === "object" && typeof (s as SizeOption).label === "string",
  );
}

function asSpec(value: unknown): ProductSpec | undefined {
  const parsed = typeof value === "string" ? safeParse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return undefined;
  }
  const spec = parsed as ProductSpec;
  const clean: ProductSpec = {};
  if (typeof spec.material === "string") clean.material = spec.material;
  if (typeof spec.fit === "string") clean.fit = spec.fit;
  if (typeof spec.stretch === "string") clean.stretch = spec.stretch;
  if (typeof spec.model === "string") clean.model = spec.model;
  return Object.keys(clean).length > 0 ? clean : undefined;
}

type ProductRow = {
  id: string;
  name: string;
  price: number;
  category: string;
  images: unknown;
  sold_out: boolean;
  pre_order: boolean;
  compare_at: number | null;
  sizes: unknown;
  spec: unknown;
  hidden: boolean;
};

function rowToProduct(row: ProductRow): Product {
  const product: Product = {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category as Product["category"],
    images: asStringArray(row.images),
    soldOut: row.sold_out,
    preOrder: row.pre_order,
  };
  if (typeof row.compare_at === "number") product.compareAt = row.compare_at;
  const sizes = asSizeOptions(row.sizes);
  if (sizes.length > 0) product.sizes = sizes;
  const spec = asSpec(row.spec);
  if (spec) product.spec = spec;
  if (row.hidden) product.hidden = true;
  return product;
}

let productsInit: Promise<void> | null = null;

/** Create the table + seed it from the code catalog once per process. */
export function ensureProductsInit(): Promise<void> {
  if (!productsInit) {
    productsInit = (async () => {
      const pool = getPostgresPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          price INTEGER NOT NULL,
          category TEXT NOT NULL,
          images JSONB NOT NULL,
          sold_out BOOLEAN NOT NULL DEFAULT FALSE,
          pre_order BOOLEAN NOT NULL DEFAULT FALSE,
          compare_at INTEGER,
          sizes JSONB NOT NULL DEFAULT '[]',
          spec JSONB,
          hidden BOOLEAN NOT NULL DEFAULT FALSE,
          sort_order INTEGER NOT NULL DEFAULT 0
        )
      `);
      const count = await pool.query("SELECT COUNT(*) AS n FROM products");
      if (Number(count.rows[0]?.n ?? 0) === 0) {
        for (let i = 0; i < PRODUCTS.length; i++) {
          const p = PRODUCTS[i];
          await pool.query(
            `INSERT INTO products
               (id, name, price, category, images, sold_out, pre_order,
                compare_at, sizes, spec, hidden, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (id) DO NOTHING`,
            [
              p.id,
              p.name,
              p.price,
              p.category,
              JSON.stringify(p.images),
              p.soldOut ?? false,
              p.preOrder ?? false,
              p.compareAt ?? null,
              JSON.stringify(p.sizes ?? []),
              p.spec ? JSON.stringify(p.spec) : null,
              false,
              i,
            ],
          );
        }
      }
    })();
  }
  return productsInit;
}

/** Live catalog in seed order. Hidden products are excluded unless asked. */
export async function listProducts(
  includeHidden: boolean,
): Promise<Product[]> {
  await ensureProductsInit();
  const pool = getPostgresPool();
  const { rows } = await pool.query(
    `SELECT * FROM products ${includeHidden ? "" : "WHERE hidden = false"}
     ORDER BY sort_order ASC, id ASC`,
  );
  return (rows as ProductRow[]).map(rowToProduct);
}

/** One visible product for the detail page; hidden products read as missing. */
export async function getProduct(id: string): Promise<Product | null> {
  await ensureProductsInit();
  const pool = getPostgresPool();
  const { rows } = await pool.query(
    "SELECT * FROM products WHERE id = $1 AND hidden = false",
    [id],
  );
  return rows[0] ? rowToProduct(rows[0] as ProductRow) : null;
}

/** Admin-only edit. Returns false when the id does not exist. */
export async function updateProduct(
  id: string,
  patch: ProductPatch,
): Promise<boolean> {
  await ensureProductsInit();
  const pool = getPostgresPool();
  const { rowCount } = await pool.query(
    `UPDATE products
     SET name = $1, price = $2, compare_at = $3, category = $4,
         sold_out = $5, pre_order = $6, hidden = $7, sizes = $8, spec = $9
     WHERE id = $10`,
    [
      patch.name,
      patch.price,
      patch.compareAt ?? null,
      patch.category,
      patch.soldOut,
      patch.preOrder ?? false,
      patch.hidden,
      JSON.stringify(patch.sizes ?? []),
      patch.spec ? JSON.stringify(patch.spec) : null,
      id,
    ],
  );
  return (rowCount ?? 0) > 0;
}

/** Admin-only insert. sort_order appends after the current maximum. */
export async function insertProduct(p: NewProduct): Promise<boolean> {
  await ensureProductsInit();
  const pool = getPostgresPool();
  const { rowCount } = await pool.query(
    `INSERT INTO products
       (id, name, price, compare_at, category, images, sold_out, pre_order,
        hidden, sizes, spec, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
       (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM products))
     ON CONFLICT (id) DO NOTHING`,
    [
      p.id,
      p.name,
      p.price,
      p.compareAt ?? null,
      p.category,
      JSON.stringify(p.images),
      p.soldOut,
      p.preOrder ?? false,
      p.hidden,
      JSON.stringify(p.sizes ?? []),
      p.spec ? JSON.stringify(p.spec) : null,
    ],
  );
  return (rowCount ?? 0) > 0;
}

/**
 * Admin-only hard delete. Past orders keep their own item snapshots
 * (name/price stored on the order), and cart lines for a deleted id are
 * dropped by the cart's catalog filter — so nothing else breaks.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  await ensureProductsInit();
  const pool = getPostgresPool();
  const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [
    id,
  ]);
  return (rowCount ?? 0) > 0;
}
