import type { Category } from "../../data/products";

export type FilterKey = "all" | Category;

export const CHIPS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "ALL PRODUCTS" },
  { key: "sets", label: "SETS" },
  { key: "t-shirts", label: "T-SHIRTS" },
  { key: "shirts", label: "SHIRTS" },
  { key: "jeans", label: "JEANS" },
  { key: "shorts", label: "SHORTS" },
];

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
