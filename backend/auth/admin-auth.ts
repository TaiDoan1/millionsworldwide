import { headers } from "next/headers";

/**
 * Defense-in-depth for admin mutations. The proxy (proxy.ts) already gates
 * /admin, but a matcher change must never silently open the write path, so
 * the settings mutation re-checks the same Basic Auth credentials here.
 *
 * Reads (getSettings, getOrders, getSubscribers) are intentionally NOT
 * guarded here: getSettings also drives the public homepage gate, and the
 * admin page itself is already behind the proxy.
 */

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function isAdminRequest(): Promise<boolean> {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;
  // No credentials configured: open in dev, closed in production.
  if (!pass) return process.env.NODE_ENV !== "production";
  if (!user) return false;

  const auth = (await headers()).get("authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  let decoded = "";
  try {
    decoded = Buffer.from(auth.slice("Basic ".length), "base64").toString(
      "utf-8"
    );
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  return (
    sep >= 0 &&
    timingSafeEqual(decoded.slice(0, sep), user) &&
    timingSafeEqual(decoded.slice(sep + 1), pass)
  );
}
