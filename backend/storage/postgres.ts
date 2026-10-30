/**
 * Postgres storage backend (node-postgres driver `pg`).
 *
 * This is the top-priority backend when a Postgres connection string is
 * configured — the long-term home for orders, subscribers and settings.
 * Unlike the single-file backends, Postgres handles many concurrent
 * writers, indexed lookups, pagination and reporting, and Railway backs
 * it up independently of the web service.
 *
 * Connection strings, in order:
 * - DATABASE_PRIVATE_URL — Railway's internal URL, preferred: same
 *   project network, not exposed to the internet.
 * - DATABASE_URL — the public URL when the private one is not set.
 *
 * SSL follows the HOST, not the variable name, because Railway resolves
 * a DATABASE_URL reference to the private internal URL at runtime: an
 * internal host (*.railway.internal) does not speak SSL, so forcing SSL
 * there fails with "The server does not support SSL connections" and
 * every settings read falls back to the Coming Soon defaults — which
 * re-hid the live shop after the 991bbe06 deploy. Public hosts do
 * require SSL (certificate not publicly verifiable, hence
 * rejectUnauthorized: false). Local hosts behave like private ones.
 *
 * If a connection string is set, Postgres is authoritative: a failed
 * init (wrong URL, database down) throws loudly on every storage call
 * instead of silently writing somewhere else, because split data across
 * two databases is worse than a visible error. When no connection
 * string is set, this backend is skipped entirely and SQLite/file apply.
 *
 * Tables mirror the SQLite schema (code as the order key, JSONB for
 * items/settings) plus a serial id used only for stable insertion order,
 * since Postgres has no rowid.
 *
 * First-run migration: when the tables are empty, legacy data is imported
 * once per process — from the SQLite database if one exists, then from
 * the JSON files — with ON CONFLICT DO NOTHING, so running it after
 * either backend was already in use is safe and order-independent.
 */
import path from "path";
import { Pool, type PoolClient } from "pg";
import * as fileStore from "./file";
import type { Order, Settings, Subscriber } from "./types";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    items JSONB NOT NULL,
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
    data JSONB NOT NULL
  );
`;

export function postgresConnectionString(): string | null {
  return (
    process.env.DATABASE_PRIVATE_URL || process.env.DATABASE_URL || null
  );
}

export function postgresConfigured(): boolean {
  return postgresConnectionString() !== null;
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = postgresConnectionString();
    if (!connectionString) {
      throw new Error("Postgres is not configured (no DATABASE_URL set)");
    }
    // SSL follows the host, not the variable name (see the header note:
    // a DATABASE_URL reference can resolve to the private internal URL).
    const isPrivateHost =
      connectionString.includes(".railway.internal") ||
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1");
    pool = new Pool({
      connectionString,
      ssl: isPrivateHost ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    pool.on("error", (error) => {
      console.error("[storage] Postgres pool error:", error);
    });
  }
  return pool;
}

/** Shared pool for other Postgres-backed stores (e.g. the product catalog). */
export function getPostgresPool(): Pool {
  return getPool();
}

let initPromise: Promise<void> | null = null;

/** Create schema + migrate legacy data once per process. Loud on failure. */
export function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = init().catch((error) => {
      console.error("[storage] Postgres init failed:", error);
      throw error;
    });
  }
  return initPromise;
}

async function init(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(SCHEMA);
    await migrate(client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {
      // The connection may already be broken; the original error matters.
    });
    throw error;
  } finally {
    client.release();
  }
}

async function migrate(client: PoolClient): Promise<void> {
  const orderCount = Number(
    (await client.query("SELECT COUNT(*) AS c FROM orders")).rows[0]?.c ?? 0
  );
  if (orderCount === 0) {
    let inserted = 0;
    // Source 1: a SQLite database, if one was ever active.
    inserted += await migrateFromSqlite(client);
    // Source 2: the JSON files (the live truth before any database).
    inserted += await migrateFromJson(client);
    if (inserted > 0) {
      console.log(`[storage] Migrated ${inserted} orders to Postgres.`);
    }
  }

  const subCount = Number(
    (await client.query("SELECT COUNT(*) AS c FROM subscribers")).rows[0]?.c ??
      0
  );
  if (subCount === 0) {
    let inserted = 0;
    inserted += await migrateSubscribersFromSqlite(client);
    inserted += await migrateSubscribersFromJson(client);
    if (inserted > 0) {
      console.log(`[storage] Migrated ${inserted} subscribers to Postgres.`);
    }
  }

  const settingsRow = await client.query(
    "SELECT data FROM settings WHERE id = 1"
  );
  if (settingsRow.rows.length === 0) {
    const fromSqlite = await readSettingsFromSqlite();
    const fromFile = await fileStore
      .readObject<Settings>("settings.json")
      .catch(() => null);
    // A corrupt seed must never throw here: it would roll back the whole
    // migration (orders and subscribers included) and leave settings
    // unreadable, which used to re-hide the shop behind Coming Soon.
    const seed = await fileStore
      .readSeedObject<Settings>("settings.json")
      .catch(() => null);
    const effective = fromSqlite ?? fromFile ?? seed;
    if (effective) {
      await client.query(
        "INSERT INTO settings (id, data) VALUES (1, $1)",
        [JSON.stringify(effective)]
      );
      console.log("[storage] Migrated settings to Postgres.");
    }
  }
}

async function migrateFromSqlite(client: PoolClient): Promise<number> {
  try {
    const { DatabaseSync } = await import("node:sqlite");
    const dbPath = path.join(fileStore.dataDir(), "shop.db");
    const { existsSync } = await import("node:fs");
    if (!existsSync(dbPath)) return 0;
    const db = new DatabaseSync(dbPath, { open: true });
    try {
      const rows = db
        .prepare("SELECT * FROM orders ORDER BY rowid")
        .all() as Record<string, unknown>[];
      let inserted = 0;
      for (const r of rows) {
        const result = await client.query(
          "INSERT INTO orders (code, items, total, name, phone, address, note, payment, status, at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (code) DO NOTHING",
          [
            r.code,
            r.items,
            r.total,
            r.name,
            r.phone,
            r.address,
            r.note,
            r.payment,
            r.status,
            r.at,
          ]
        );
        inserted += result.rowCount ?? 0;
      }
      return inserted;
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("[storage] SQLite-source migration skipped:", error);
    return 0;
  }
}

async function migrateFromJson(client: PoolClient): Promise<number> {
  try {
    const legacy = await fileStore.readArray<Order>("orders.json");
    let inserted = 0;
    for (const o of legacy) {
      const result = await client.query(
        "INSERT INTO orders (code, items, total, name, phone, address, note, payment, status, at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (code) DO NOTHING",
        [
          o.code,
          JSON.stringify(o.items),
          o.total,
          o.customer.name,
          o.customer.phone,
          o.customer.address,
          o.customer.note ?? null,
          o.payment,
          o.status,
          o.at,
        ]
      );
      inserted += result.rowCount ?? 0;
    }
    return inserted;
  } catch (error) {
    console.error("[storage] JSON-source order migration skipped:", error);
    return 0;
  }
}

async function migrateSubscribersFromSqlite(
  client: PoolClient
): Promise<number> {
  try {
    const { DatabaseSync } = await import("node:sqlite");
    const dbPath = path.join(fileStore.dataDir(), "shop.db");
    const { existsSync } = await import("node:fs");
    if (!existsSync(dbPath)) return 0;
    const db = new DatabaseSync(dbPath, { open: true });
    try {
      const rows = db
        .prepare("SELECT * FROM subscribers ORDER BY rowid")
        .all() as Record<string, unknown>[];
      let inserted = 0;
      for (const r of rows) {
        const result = await client.query(
          "INSERT INTO subscribers (email, source, at) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
          [r.email, r.source, r.at]
        );
        inserted += result.rowCount ?? 0;
      }
      return inserted;
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("[storage] SQLite-source subscriber migration skipped:", error);
    return 0;
  }
}

async function migrateSubscribersFromJson(
  client: PoolClient
): Promise<number> {
  try {
    const legacy = await fileStore.readArray<Subscriber>("subscribers.json");
    let inserted = 0;
    for (const s of legacy) {
      const result = await client.query(
        "INSERT INTO subscribers (email, source, at) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
        [s.email, s.source, s.at]
      );
      inserted += result.rowCount ?? 0;
    }
    return inserted;
  } catch (error) {
    console.error(
      "[storage] JSON-source subscriber migration skipped:",
      error
    );
    return 0;
  }
}

async function readSettingsFromSqlite(): Promise<Settings | null> {
  try {
    const { DatabaseSync } = await import("node:sqlite");
    const dbPath = path.join(fileStore.dataDir(), "shop.db");
    const { existsSync } = await import("node:fs");
    if (!existsSync(dbPath)) return null;
    const db = new DatabaseSync(dbPath, { open: true });
    try {
      const row = db.prepare("SELECT data FROM settings WHERE id = 1").get() as
        | { data: string }
        | undefined;
      if (!row) return null;
      try {
        return JSON.parse(row.data) as Settings;
      } catch {
        return null;
      }
    } finally {
      db.close();
    }
  } catch (error) {
    console.error("[storage] SQLite-source settings migration skipped:", error);
    return null;
  }
}

type OrderRow = {
  code: string;
  items: Order["items"];
  total: number;
  name: string;
  phone: string;
  address: string;
  note: string | null;
  payment: Order["payment"];
  status: Order["status"];
  at: string;
};

function orderFromRow(r: OrderRow): Order {
  return {
    code: r.code,
    items: r.items,
    total: r.total,
    customer: {
      name: r.name,
      phone: r.phone,
      address: r.address,
      note: r.note ?? undefined,
    },
    payment: r.payment,
    status: r.status,
    at: r.at,
  };
}

export async function listOrders(): Promise<Order[]> {
  await ensureInit();
  const result = await getPool().query<OrderRow>(
    "SELECT code, items, total, name, phone, address, note, payment, status, at FROM orders ORDER BY id"
  );
  return result.rows.map(orderFromRow);
}

export async function appendOrder(order: Order): Promise<void> {
  await ensureInit();
  await getPool().query(
    "INSERT INTO orders (code, items, total, name, phone, address, note, payment, status, at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
    [
      order.code,
      JSON.stringify(order.items),
      order.total,
      order.customer.name,
      order.customer.phone,
      order.customer.address,
      order.customer.note ?? null,
      order.payment,
      order.status,
      order.at,
    ]
  );
}

export async function updateOrderStatus(
  code: string,
  status: Order["status"]
): Promise<boolean> {
  await ensureInit();
  const result = await getPool().query(
    "UPDATE orders SET status = $1 WHERE code = $2",
    [status, code]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function listSubscribers(): Promise<Subscriber[]> {
  await ensureInit();
  const result = await getPool().query<Subscriber>(
    "SELECT email, source, at FROM subscribers ORDER BY email"
  );
  return result.rows;
}

export async function addSubscriber(
  sub: Subscriber
): Promise<"added" | "duplicate"> {
  await ensureInit();
  const result = await getPool().query(
    "INSERT INTO subscribers (email, source, at) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
    [sub.email, sub.source, sub.at]
  );
  return (result.rowCount ?? 0) === 1 ? "added" : "duplicate";
}

export async function readSettings(): Promise<Settings | null> {
  await ensureInit();
  const result = await getPool().query<{ data: Settings }>(
    "SELECT data FROM settings WHERE id = 1"
  );
  return result.rows[0]?.data ?? null;
}

export async function writeSettings(s: Settings): Promise<void> {
  await ensureInit();
  await getPool().query(
    "INSERT INTO settings (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = excluded.data",
    [JSON.stringify(s)]
  );
}
