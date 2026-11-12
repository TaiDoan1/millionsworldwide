import type { MetadataRoute } from "next";
import { getSiteUrl } from "./lib/site-url";
import { getProducts } from "./actions/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/trangchu", priority: 0.9, changeFrequency: "weekly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
    { path: "/track-order", priority: 0.5, changeFrequency: "monthly" },
    { path: "/millions-care", priority: 0.4, changeFrequency: "monthly" },
    { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
    { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/shipping", priority: 0.3, changeFrequency: "yearly" },
    { path: "/inspection", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/payment", priority: 0.3, changeFrequency: "yearly" },
  ];
  // Every visible product page, so Google finds the catalog from the
  // sitemap instead of having to discover each detail page by crawling.
  // getProducts() already excludes hidden products.
  const products = await getProducts().catch(() => []);
  return [
    ...routes.map((r) => ({
      url: `${base}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...products.map((p) => ({
      url: `${base}/trangchu/${p.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
