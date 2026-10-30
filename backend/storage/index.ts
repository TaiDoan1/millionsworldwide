/**
 * Storage backend selection for orders, email signups and site settings.
 *
 * The backend is picked automatically per environment, so the "Vercel or
 * Railway?" question no longer blocks the launch:
 *
 * - Vercel: link a KV database to the project (dashboard -> Storage ->
 *   Create KV). Vercel injects KV_REST_API_URL + KV_REST_API_TOKEN and all
 *   writes below go to KV, surviving every redeploy and restart.
 * - Railway (or any host with a disk): attach a persistent volume at the
 *   data directory (default <project>/app/data, override with DATA_DIR)
 *   and the existing file storage keeps working across restarts.
 *
 * Default when neither is configured is the current file behaviour, so
 * local development is unchanged.
 */
import type { Order, Settings, Subscriber } from "./types";
import * as fileStore from "./file";
import * as kvStore from "./kv";

export function storageBackend(): "kv" | "file" {
  return kvStore.kvAvailable() ? "kv" : "file";
}

/** Loud server-side warning when writes are known to be ephemeral. */
function warnIfEphemeralWrites(): void {
  if (storageBackend() === "file" && process.env.VERCEL === "1") {
    console.warn(
      "[storage] Running on Vercel without KV_REST_API_URL/KV_REST_API_TOKEN: " +
        "orders and signups will NOT persist. Link a Vercel KV database to the project to fix this."
    );
  }
}

export async function listOrders(): Promise<Order[]> {
  return storageBackend() === "kv"
    ? kvStore.kvListOrders()
    : fileStore.readArray<Order>("orders.json");
}

export async function appendOrder(order: Order): Promise<void> {
  warnIfEphemeralWrites();
  if (storageBackend() === "kv") {
    await kvStore.kvAppendOrder(order);
    return;
  }
  const orders = await fileStore.readArray<Order>("orders.json");
  orders.push(order);
  await fileStore.writeArray("orders.json", orders);
}

export async function listSubscribers(): Promise<Subscriber[]> {
  return storageBackend() === "kv"
    ? kvStore.kvListSubscribers()
    : fileStore.readArray<Subscriber>("subscribers.json");
}

export async function addSubscriber(
  sub: Subscriber
): Promise<"added" | "duplicate"> {
  warnIfEphemeralWrites();
  if (storageBackend() === "kv") {
    return kvStore.kvAddSubscriber(sub);
  }
  const list = await fileStore.readArray<Subscriber>("subscribers.json");
  if (list.some((s) => s.email === sub.email)) return "duplicate";
  list.push(sub);
  await fileStore.writeArray("subscribers.json", list);
  return "added";
}

/**
 * Stored settings, or null when nothing was saved yet. Callers merge with
 * defaults. On KV the bundled repo seed is the fallback so the launch
 * configuration in app/data/settings.json is never silently dropped.
 */
export async function readSettings(): Promise<Settings | null> {
  if (storageBackend() === "kv") {
    const stored = await kvStore.kvReadSettings();
    if (stored) return stored;
    return fileStore.readSeedObject<Settings>("settings.json");
  }
  const stored = await fileStore.readObject<Settings>("settings.json");
  if (stored) return stored;
  // A fresh persistent volume shadows the bundled seed file: fall back to the
  // repo seed so the launch configuration is kept instead of hardcoded defaults.
  return fileStore.readSeedObject<Settings>("settings.json");
}

export async function writeSettings(s: Settings): Promise<void> {
  warnIfEphemeralWrites();
  if (storageBackend() === "kv") {
    await kvStore.kvWriteSettings(s);
    return;
  }
  await fileStore.writeObject("settings.json", s);
}
