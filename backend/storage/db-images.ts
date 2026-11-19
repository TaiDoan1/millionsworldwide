/**
 * Temporary durable store for uploaded product photos (Postgres).
 *
 * Why this exists: the Railway volume has lost every uploaded photo
 * so far — 33 gone after the region move (15/11), and by 19/11 all
 * 57 /uploads/ paths on the shop were 404, including photos uploaded
 * that same morning: each deploy restarts the container and the
 * volume does not keep the files. Cloudflare R2 is the permanent
 * home, but it is not configured yet (it needs the 5 Railway
 * variables). Until then, new uploads are saved here, as base64 TEXT
 * in Postgres, which Railway backs up and which survives deploys.
 *
 * When R2 is configured, new uploads go to R2 instead (the upload
 * route checks R2 first) and these rows keep serving as a fallback —
 * nothing has to be migrated in a hurry, and the stored product paths
 * keep the "/uploads/<file>" shape either way. Only the URL path is
 * stored on products, never the bytes; this table is the one place
 * that holds bytes, and only until R2 takes over.
 *
 * Size: uploads are capped at 5MB each and resized to 1200px wide
 * before they get here, so a shop this size holds tens of megabytes
 * at most — fine as a temporary store, not a reason to keep it
 * forever.
 */
import { getPostgresPool, postgresConfigured } from "./postgres";

let initPromise: Promise<void> | null = null;

/** Create the table once per process. No-op when Postgres is absent. */
export function ensureDbImagesInit(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      if (!postgresConfigured()) return;
      await getPostgresPool().query(`
        CREATE TABLE IF NOT EXISTS uploaded_images (
          key TEXT PRIMARY KEY,
          content_type TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
    })();
  }
  return initPromise;
}

/**
 * Save one uploaded photo's bytes under its "/uploads/<file>" name.
 * Returns false when Postgres is not configured (the caller then
 * falls back to the volume); throws when Postgres is configured but
 * the write fails, so the upload is reported instead of landing on
 * a volume that would lose it again.
 */
export async function saveDbImage(
  key: string,
  data: Buffer,
  contentType: string,
): Promise<boolean> {
  if (!postgresConfigured()) return false;
  await ensureDbImagesInit();
  await getPostgresPool().query(
    `INSERT INTO uploaded_images (key, content_type, data)
     VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE
     SET content_type = excluded.content_type, data = excluded.data`,
    [key, contentType, data.toString("base64")],
  );
  return true;
}

/** Read one stored photo's bytes, or null when it is not in the DB. */
export async function getDbImage(
  key: string,
): Promise<{ data: Buffer; contentType: string } | null> {
  if (!postgresConfigured()) return null;
  await ensureDbImagesInit();
  const result = await getPostgresPool().query<{
    content_type: string;
    data: string;
  }>("SELECT content_type, data FROM uploaded_images WHERE key = $1", [key]);
  const row = result.rows[0];
  if (!row) return null;
  return {
    data: Buffer.from(row.data, "base64"),
    contentType: row.content_type,
  };
}

/** True when the DB holds a photo under this "/uploads/<file>" name. */
export async function dbImageExists(key: string): Promise<boolean> {
  if (!postgresConfigured()) return false;
  await ensureDbImagesInit();
  const result = await getPostgresPool().query(
    "SELECT 1 FROM uploaded_images WHERE key = $1",
    [key],
  );
  return result.rows.length > 0;
}
