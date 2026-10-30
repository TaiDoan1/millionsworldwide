/**
 * Storage backend selection for orders, email signups and site settings.
 *
 * Priority:
 * - Postgres when DATABASE_PRIVATE_URL or DATABASE_URL is set (Railway
 *   Postgres): the long-term backend. A configured Postgres is
 *   authoritative — if it cannot be reached, storage calls fail loudly
 *   instead of silently writing to another backend, because split data
 *   across two databases is worse than a visible error.
 * - SQLite (shop.db on the data directory) otherwise — a real database
 *   with transactions, and no new service or cost. On Railway the data
 *   directory is the persistent Volume (/data via DATA_DIR).
 * - File JSON only when SQLite itself is unavailable (Node without
 *   node:sqlite): the legacy path, kept as a safety net, not a choice.
 *
 * The frontend never sees this choice: every function below keeps the
 * same signature whichever backend is active.
 */
import type { Order, Settings, Subscriber } from "./types";
import * as fileStore from "./file";
import * as postgresStore from "./postgres";
import * as sqliteStore from "./sqlite";

type Backend = "postgres" | "sqlite" | "file";

let backend: Backend | null = null;

async function resolveBackend(): Promise<Backend> {
  if (backend) return backend;
  if (postgresStore.postgresConfigured()) backend = "postgres";
  else if (await sqliteStore.sqliteAvailable()) backend = "sqlite";
  else backend = "file";
  return backend;
}

/** Human-readable backend name, shown on the admin page. */
export async function storageBackendLabel(): Promise<string> {
  const b = await resolveBackend();
  if (b === "postgres") return "Postgres (Railway)";
  if (b === "sqlite") return "SQLite (shop.db trên Volume)";
  return "File JSON (Volume)";
}

/** Loud server-side warning when writes are known to be ephemeral. */
async function warnIfEphemeralWrites(): Promise<void> {
  if ((await resolveBackend()) === "file" && process.env.VERCEL === "1") {
    console.warn(
      "[storage] Running on Vercel with file storage: " +
        "orders and signups will NOT persist. Use Postgres (DATABASE_URL) for persistent storage."
    );
  }
}

export async function listOrders(): Promise<Order[]> {
  const b = await resolveBackend();
  if (b === "postgres") return postgresStore.listOrders();
  if (b === "sqlite") return sqliteStore.listOrders();
  return fileStore.readArray<Order>("orders.json");
}

export async function appendOrder(order: Order): Promise<void> {
  await warnIfEphemeralWrites();
  const b = await resolveBackend();
  if (b === "postgres") {
    await postgresStore.appendOrder(order);
    return;
  }
  if (b === "sqlite") {
    await sqliteStore.appendOrder(order);
    return;
  }
  // Locked: the read-append-write must not interleave with another checkout.
  await fileStore.withFileLock("orders.json", async () => {
    const orders = await fileStore.readArray<Order>("orders.json");
    orders.push(order);
    await fileStore.writeArray("orders.json", orders);
  });
}

/** Change one order's status. Returns false when the code is not found. */
export async function updateOrderStatus(
  code: string,
  status: Order["status"]
): Promise<boolean> {
  const b = await resolveBackend();
  if (b === "postgres") return postgresStore.updateOrderStatus(code, status);
  if (b === "sqlite") return sqliteStore.updateOrderStatus(code, status);
  return fileStore.withFileLock("orders.json", async () => {
    const orders = await fileStore.readArray<Order>("orders.json");
    const order = orders.find((o) => o.code === code);
    if (!order) return false;
    order.status = status;
    await fileStore.writeArray("orders.json", orders);
    return true;
  });
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const b = await resolveBackend();
  if (b === "postgres") return postgresStore.listSubscribers();
  if (b === "sqlite") return sqliteStore.listSubscribers();
  return fileStore.readArray<Subscriber>("subscribers.json");
}

export async function addSubscriber(
  sub: Subscriber
): Promise<"added" | "duplicate"> {
  await warnIfEphemeralWrites();
  const b = await resolveBackend();
  if (b === "postgres") return postgresStore.addSubscriber(sub);
  if (b === "sqlite") return sqliteStore.addSubscriber(sub);
  // Locked: the dedup check and the write must not interleave, or the same
  // email could be stored twice by two simultaneous signups.
  return fileStore.withFileLock("subscribers.json", async () => {
    const list = await fileStore.readArray<Subscriber>("subscribers.json");
    if (list.some((s) => s.email === sub.email)) return "duplicate";
    list.push(sub);
    await fileStore.writeArray("subscribers.json", list);
    return "added";
  });
}

/**
 * Stored settings, or null when nothing was saved yet. Callers merge with
 * defaults. On Postgres and SQLite the bundled repo seed is the fallback so the
 * launch configuration in app/data/settings.json is never silently dropped.
 */
export async function readSettings(): Promise<Settings | null> {
  const b = await resolveBackend();
  if (b === "postgres") {
    const stored = await postgresStore.readSettings();
    if (stored) return stored;
    return fileStore.readSeedObject<Settings>("settings.json");
  }
  if (b === "sqlite") {
    const stored = await sqliteStore.readSettings();
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
  await warnIfEphemeralWrites();
  const b = await resolveBackend();
  if (b === "postgres") {
    await postgresStore.writeSettings(s);
    return;
  }
  if (b === "sqlite") {
    await sqliteStore.writeSettings(s);
    return;
  }
  await fileStore.withFileLock("settings.json", async () => {
    await fileStore.writeObject("settings.json", s);
  });
}
