/**
 * SQLite storage backend, on Node's built-in node:sqlite.
 *
 * Why SQLite instead of another service: it is a real relational database
 * (ACID transactions, primary keys, indexed lookups) with no new dependency,
 * no new hosted service and no new cost — the database file lives next to
 * the old JSON files on the same Railway Volume, so it survives redeploys
 * exactly like they did. Transactions are what finally fix the lost-order
 * race properly: concurrent checkouts no longer read-modify-write a shared
 * JSON file. Postgres is the preferred backend when a connection
 * string is configured — the storage interface in
 * backend/storage/index.ts is unchanged, so that swap touches one file.
 *
 * Startup: the first storage call opens shop.db, creates the schema and
 * migrates any legacy JSON data once per process (orders, subscribers,
 * settings). The JSON files are left untouched as a backup; after a
 * successful migration they are no longer the source of truth.
 *
 * Availability: node:sqlite needs Node 22.5+. If it is missing and SQLite
 * was never activated (no shop.db exists), init returns null and
 * backend/storage/index.ts falls back to the file backend instead of
 * crashing the shop. But if shop.db DOES exist and node:sqlite is gone,
 * init fails loudly: falling back to the JSON files then would read
 * stale pre-migration data and split orders across two stores — the
 * same "configured backend is authoritative" rule Postgres follows.
 */
import path from "path";
import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import * as fileStore from "./file";
import type { Order, Settings, Subscriber } from "./types";

const DB_FILE = "shop.db";

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS orders (
    code TEXT PRIMARY KEY,
    items TEXT NOT NULL,
    total INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    note TEXT,
    payment TEXT NOT NULL,
    status TEXT NOT NULL,
    at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS subscribers (
    email TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  );
`;

let dbPromise: Promise<DatabaseSync | null> | null = null;

/** Marker: SQLite was never activated, so the file fallback is safe. */
const SQLITE_NEVER_USED = "SQLITE_MODULE_MISSING_AND_NO_DB";

/**
 * Open (once per process), return null when SQLite was never used, or
 * reject loudly when a shop.db exists but cannot be opened.
 */
export function getSqliteDb(): Promise<DatabaseSync | null> {
  if (!dbPromise) {
    dbPromise = initDb().catch((error) => {
      if (error instanceof Error && error.message === SQLITE_NEVER_USED) {
        console.error(
          "[storage] SQLite unavailable, falling back to file storage."
        );
        return null;
      }
      console.error("[storage] SQLite failed:", error);
      throw error;
    });
  }
  return dbPromise;
}

export async function sqliteAvailable(): Promise<boolean> {
  return (await getSqliteDb()) !== null;
}

async function initDb(): Promise<DatabaseSync> {
  // Dynamic import: a static import would crash the whole app on a Node
  // without node:sqlite, before any fallback could run.
  let DatabaseSyncCtor: typeof DatabaseSync;
  try {
    ({ DatabaseSync: DatabaseSyncCtor } = await import("node:sqlite"));
  } catch {
    if (existsSync(path.join(fileStore.dataDir(), DB_FILE))) {
      throw new Error(
        "SQLite database exists but node:sqlite is unavailable — refusing " +
          "to fall back to stale JSON files"
      );
    }
    throw new Error(SQLITE_NEVER_USED);
  }
  const db = new DatabaseSyncCtor(path.join(fileStore.dataDir(), DB_FILE));
  db.exec(SCHEMA);
  await migrateFromJson(db);
  return db;
}

/**
 * One-time-per-process migration from the legacy JSON files. Each file is
 * migrated only while its table is empty, inserts ignore duplicates, and
 * a file that fails to parse is skipped loudly (its JSON stays on disk
 * for manual recovery) instead of blocking the shop.
 */
async function migrateFromJson(db: DatabaseSync): Promise<void> {
  try {
    const orderCount = (
      db.prepare("SELECT COUNT(*) AS c FROM orders").get() as { c: number }
    ).c;
    if (orderCount === 0) {
      const legacy = await fileStore.readArray<Order>("orders.json");
      const stmt = db.prepare(
        "INSERT OR IGNORE INTO orders (code, items, total, name, phone, address, note, payment, status, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      let inserted = 0;
      for (const o of legacy) {
        inserted += Number(
          stmt.run(
            o.code,
            JSON.stringify(o.items),
            o.total,
            o.customer.name,
            o.customer.phone,
            o.customer.address,
            o.customer.note ?? null,
            o.payment,
            o.status,
            o.at
          ).changes
        );
      }
      if (inserted > 0) {
        console.log(
          `[storage] Migrated ${inserted} orders from orders.json to SQLite.`
        );
      }
    }
  } catch (error) {
    console.error("[storage] Order migration skipped:", error);
  }

  try {
    const subCount = (
      db.prepare("SELECT COUNT(*) AS c FROM subscribers").get() as { c: number }
    ).c;
    if (subCount === 0) {
      const legacy = await fileStore.readArray<Subscriber>("subscribers.json");
      const stmt = db.prepare(
        "INSERT OR IGNORE INTO subscribers (email, source, at) VALUES (?, ?, ?)"
      );
      let inserted = 0;
      for (const s of legacy) {
        inserted += Number(stmt.run(s.email, s.source, s.at).changes);
      }
      if (inserted > 0) {
        console.log(
          `[storage] Migrated ${inserted} subscribers from subscribers.json to SQLite.`
        );
      }
    }
  } catch (error) {
    console.error("[storage] Subscriber migration skipped:", error);
  }

  try {
    const row = db.prepare("SELECT data FROM settings WHERE id = 1").get();
    if (!row) {
      const fromFile = await fileStore.readObject<Settings>("settings.json");
      const effective =
        fromFile ?? (await fileStore.readSeedObject<Settings>("settings.json"));
      if (effective) {
        db.prepare("INSERT INTO settings (id, data) VALUES (1, ?)").run(
          JSON.stringify(effective)
        );
        console.log("[storage] Migrated settings to SQLite.");
      }
    }
  } catch (error) {
    console.error("[storage] Settings migration skipped:", error);
  }
}

function orderFromRow(r: Record<string, unknown>): Order {
  return {
    code: r.code as string,
    items: JSON.parse(r.items as string) as Order["items"],
    total: r.total as number,
    customer: {
      name: r.name as string,
      phone: r.phone as string,
      address: r.address as string,
      note: (r.note as string | null) ?? undefined,
    },
    payment: r.payment as Order["payment"],
    status: r.status as Order["status"],
    at: r.at as string,
  };
}

function requireDb(db: DatabaseSync | null): DatabaseSync {
  if (!db) throw new Error("SQLite unavailable");
  return db;
}

export async function listOrders(): Promise<Order[]> {
  const db = requireDb(await getSqliteDb());
  return db
    .prepare("SELECT * FROM orders ORDER BY rowid")
    .all()
    .map(orderFromRow);
}

export async function appendOrder(order: Order): Promise<void> {
  const db = requireDb(await getSqliteDb());
  // A duplicate code violates the primary key and fails loudly instead of
  // silently overwriting another order; the service already checks codes
  // against the current list, so this is a last-resort guard.
  db.prepare(
    "INSERT INTO orders (code, items, total, name, phone, address, note, payment, status, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    order.code,
    JSON.stringify(order.items),
    order.total,
    order.customer.name,
    order.customer.phone,
    order.customer.address,
    order.customer.note ?? null,
    order.payment,
    order.status,
    order.at
  );
}

export async function updateOrderStatus(
  code: string,
  status: Order["status"]
): Promise<boolean> {
  const db = requireDb(await getSqliteDb());
  const result = db
    .prepare("UPDATE orders SET status = ? WHERE code = ?")
    .run(status, code);
  return Number(result.changes) > 0;
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const db = requireDb(await getSqliteDb());
  return db
    .prepare("SELECT * FROM subscribers ORDER BY rowid")
    .all()
    .map((r) => ({
      email: r.email as string,
      source: r.source as string,
      at: r.at as string,
    }));
}

export async function addSubscriber(
  sub: Subscriber
): Promise<"added" | "duplicate"> {
  const db = requireDb(await getSqliteDb());
  // INSERT OR IGNORE makes the email dedup atomic: concurrent signups
  // with the same address can no longer both slip through.
  const result = db
    .prepare("INSERT OR IGNORE INTO subscribers (email, source, at) VALUES (?, ?, ?)")
    .run(sub.email, sub.source, sub.at);
  return Number(result.changes) === 1 ? "added" : "duplicate";
}

export async function readSettings(): Promise<Settings | null> {
  const db = requireDb(await getSqliteDb());
  const row = db.prepare("SELECT data FROM settings WHERE id = 1").get();
  if (!row) return null;
  try {
    return JSON.parse(row.data as string) as Settings;
  } catch {
    return null;
  }
}

export async function writeSettings(s: Settings): Promise<void> {
  const db = requireDb(await getSqliteDb());
  db.prepare(
    "INSERT INTO settings (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data"
  ).run(JSON.stringify(s));
}
