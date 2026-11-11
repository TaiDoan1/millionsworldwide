import type { ProductCategory } from "../../data/products";

/** "all" or a category slug. Slugs are dynamic (managed in /mw-office),
 *  so the filter is a plain string, not a fixed union. */
export type FilterKey = string;

/** Filter chips: ALL first, then the live categories in admin order. */
export function chipsFor(
  categories: ProductCategory[],
): { key: FilterKey; label: string }[] {
  return [
    { key: "all", label: "ALL PRODUCTS" },
    ...categories.map((c) => ({ key: c.slug, label: c.label.toUpperCase() })),
  ];
}

export type SortKey =
  | "best-selling"
  | "name-a-z"
  | "name-z-a"
  | "price-low-high"
  | "price-high-low"
  | "newest"
  | "oldest";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "best-selling", label: "best selling" },
  { key: "name-a-z", label: "name a-z" },
  { key: "name-z-a", label: "name z-a" },
  { key: "price-low-high", label: "price low to high" },
  { key: "price-high-low", label: "price high to low" },
  { key: "newest", label: "newest first" },
  { key: "oldest", label: "oldest first" },
];

export const PAGE_SIZE = 12;
