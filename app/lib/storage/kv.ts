/**
 * Vercel KV backend over the Upstash-compatible REST API.
 *
 * No SDK dependency: every command is a POST to
 * <KV_REST_API_URL>/<command> with a JSON array body, authenticated with
 * the KV_REST_API_TOKEN bearer token. Vercel injects both environment
 * variables automatically when a KV database is linked to the project,
 * so enabling persistent storage is: Vercel dashboard -> Storage ->
 * Create KV -> link to project -> redeploy. No code change needed.
 *
 * Data layout:
 * - mw:orders      Redis list, one JSON order per element (RPUSH is atomic,
 *                  so concurrent checkouts never lose an order).
 * - mw:subscribers Redis hash field=email -> JSON subscriber (HSETNX is
 *                  atomic, so email dedup is race-free).
 * - mw:settings    Redis string holding the settings JSON.
 */
import type { Order, Settings, Subscriber } from "./types";

const ORDERS_KEY = "mw:orders";
const SUBSCRIBERS_KEY = "mw:subscribers";
const SETTINGS_KEY = "mw:settings";

function kvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

/** True when the KV credentials are present in this environment. */
export function kvAvailable(): boolean {
  return kvConfig() !== null;
}

async function kvCommand<T>(command: string, args: unknown[]): Promise<T> {
  const cfg = kvConfig();
  if (!cfg) throw new Error("KV not configured");
  const res = await fetch(`${cfg.url}/${command}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    throw new Error(`KV command "${command}" failed with HTTP ${res.status}`);
  }
  const json = (await res.json()) as { result?: T; error?: string };
  if (typeof json.error === "string") {
    throw new Error(`KV command "${command}" error: ${json.error}`);
  }
  return json.result as T;
}

/** Parse an array of JSON-encoded strings, skipping corrupt entries. */
function parseJsonStrings<T>(items: unknown): T[] {
  if (!Array.isArray(items)) return [];
  const out: T[] = [];
  for (const item of items) {
    if (typeof item !== "string") continue;
    try {
      out.push(JSON.parse(item) as T);
    } catch {
      /* skip corrupt entries */
    }
  }
  return out;
}

export async function kvListOrders(): Promise<Order[]> {
  const result = await kvCommand<string[] | null>("lrange", [ORDERS_KEY, 0, -1]);
  return parseJsonStrings<Order>(result ?? []);
}

export async function kvAppendOrder(order: Order): Promise<void> {
  await kvCommand<number>("rpush", [ORDERS_KEY, JSON.stringify(order)]);
}

export async function kvAddSubscriber(
  sub: Subscriber
): Promise<"added" | "duplicate"> {
  const added = await kvCommand<number>("hsetnx", [
    SUBSCRIBERS_KEY,
    sub.email,
    JSON.stringify(sub),
  ]);
  return added === 1 ? "added" : "duplicate";
}

export async function kvListSubscribers(): Promise<Subscriber[]> {
  // HGETALL returns a flat [field, value, field, value, ...] array.
  const result = await kvCommand<string[] | null>("hgetall", [SUBSCRIBERS_KEY]);
  const flat = Array.isArray(result) ? result : [];
  const values: string[] = [];
  for (let i = 1; i < flat.length; i += 2) values.push(flat[i]);
  return parseJsonStrings<Subscriber>(values);
}

export async function kvReadSettings(): Promise<Settings | null> {
  const result = await kvCommand<string | null>("get", [SETTINGS_KEY]);
  if (typeof result !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(result);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Settings)
      : null;
  } catch {
    return null;
  }
}

export async function kvWriteSettings(s: Settings): Promise<void> {
  await kvCommand<string>("set", [SETTINGS_KEY, JSON.stringify(s)]);
}
