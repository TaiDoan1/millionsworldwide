/**
 * Postgres-backed category list.
 *
 * Categories used to be a hardcoded list in app/data/products.ts. They
 * are now a table the owner manages in /mw-office (add / rename /
 * reorder / delete): the shop's filter chips and the mega-menu tabs
 * read this list, so a new category shows up without a code push.
 *
 * Deliberately Postgres-only, like the products table: without
 * DATABASE_URL the service layer falls back to the code seed for
 * display, and admin edits are refused with a clear message.
 */
import { SEED_CATEGORIES, type ProductCategory } from "../../app/data/products";
import { getPostgresPool } from "./postgres";

export type { ProductCategory };

/** A category row: slug (the key products reference), label, order. */
export type CategoryInput = {
  slug: string;
  label: string;
};

let categoriesInit: Promise<void> | null = null;

/** Create the table + seed it from the code list once per process. */
export function ensureCategoriesInit(): Promise<void> {
  if (!categoriesInit) {
    categoriesInit = (async () => {
      const pool = getPostgresPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
          slug TEXT PRIMARY KEY,
          label TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0
        )
      `);
      const count = await pool.query("SELECT COUNT(*) AS n FROM categories");
      if (Number(count.rows[0]?.n ?? 0) === 0) {
        for (let i = 0; i < SEED_CATEGORIES.length; i++) {
          const c = SEED_CATEGORIES[i];
          await pool.query(
            `INSERT INTO categories (slug, label, sort_order)
             VALUES ($1, $2, $3)
             ON CONFLICT (slug) DO NOTHING`,
            [c.slug, c.label, i],
          );
        }
      }
    })();
  }
  return categoriesInit;
}

type CategoryRow = {
  slug: string;
  label: string;
  sort_order: number;
};

function rowToCategory(row: CategoryRow): ProductCategory {
  return { slug: row.slug, label: row.label };
}

/** Live categories in display order. */
export async function listCategories(): Promise<ProductCategory[]> {
  await ensureCategoriesInit();
  const pool = getPostgresPool();
  const { rows } = await pool.query(
    "SELECT * FROM categories ORDER BY sort_order ASC, slug ASC",
  );
  return (rows as CategoryRow[]).map(rowToCategory);
}

/** Admin-only insert. sort_order appends after the current maximum.
 *  Returns false when the slug already exists. The existence check is
 *  explicit (a SELECT first) rather than relying on the rowCount of an
 *  ON CONFLICT DO NOTHING insert, whose value differs between drivers. */
export async function insertCategory(c: CategoryInput): Promise<boolean> {
  await ensureCategoriesInit();
  const pool = getPostgresPool();
  const existing = await pool.query(
    "SELECT slug FROM categories WHERE slug = $1",
    [c.slug],
  );
  if ((existing.rowCount ?? 0) > 0) return false;
  const { rowCount } = await pool.query(
    `INSERT INTO categories (slug, label, sort_order)
     VALUES ($1, $2, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM categories))
     ON CONFLICT (slug) DO NOTHING`,
    [c.slug, c.label],
  );
  return (rowCount ?? 0) > 0;
}

/** Admin-only rename / reorder. The slug itself never changes — it is
 *  the key products reference. Returns false when the slug is unknown. */
export async function updateCategory(
  slug: string,
  patch: { label: string; sortOrder: number },
): Promise<boolean> {
  await ensureCategoriesInit();
  const pool = getPostgresPool();
  const { rowCount } = await pool.query(
    "UPDATE categories SET label = $1, sort_order = $2 WHERE slug = $3",
    [patch.label, patch.sortOrder, slug],
  );
  return (rowCount ?? 0) > 0;
}

/** Admin-only delete. The service refuses it while products use the
 *  category; this only runs once that check has passed. */
export async function deleteCategory(slug: string): Promise<boolean> {
  await ensureCategoriesInit();
  const pool = getPostgresPool();
  const { rowCount } = await pool.query(
    "DELETE FROM categories WHERE slug = $1",
    [slug],
  );
  return (rowCount ?? 0) > 0;
}
