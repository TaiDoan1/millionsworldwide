import { headers } from "next/headers";

/**
 * Tiny in-memory rate limiter for public form actions (orders, signups,
 * order lookups). It is per server instance: good enough for a single
 * Railway instance, and it degrades to "allow" rather than breaking the
 * shop if anything about the request is unreadable.
 *
 * Limits are generous on purpose — they stop bots hammering the forms,
 * not real customers.
 */

type Entry = { count: number; resetAt: number };

const hits = new Map<string, Entry>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  if (hits.size > 2000) {
    for (const [k, v] of hits) {
      if (now >= v.resetAt) hits.delete(k);
    }
  }
  const entry = hits.get(key);
  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

/** Rate-limit key for the caller: "<action>:<client ip>". */
export async function clientKey(prefix: string): Promise<string> {
  let ip = "unknown";
  try {
    const forwarded = (await headers()).get("x-forwarded-for") || "";
    ip = forwarded.split(",")[0]?.trim() || "unknown";
  } catch {
    // Keep "unknown" — the limiter still applies, shared across unknowns.
  }
  return `${prefix}:${ip}`;
}
