/**
 * Page-number window for the admin pagers (orders, products, email).
 * Always shows the first and last page plus the current page and its
 * neighbours, with "…" where pages are skipped. Pure — unit-tested,
 * no React, so any list can reuse it.
 */
export function pageWindow(
  current: number,
  total: number,
): (number | "…")[] {
  if (total <= 1) return [1];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set<number>([
    1,
    2,
    total - 1,
    total,
    current - 1,
    current,
    current + 1,
  ]);
  const pages = [...keep]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of pages) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}
