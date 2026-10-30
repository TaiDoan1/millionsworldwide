/**
 * Canonical site URL for metadata, sitemap and robots.
 * Priority: NEXT_PUBLIC_SITE_URL (set once the production domain is final),
 * then the Vercel production URL, then localhost for development.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
