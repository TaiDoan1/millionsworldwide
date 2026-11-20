/**
 * Cloudflare R2 for photos uploaded from /mw-office.
 *
 * Why R2: photos uploaded to the Railway volume kept disappearing
 * (all 33 uploaded images were 404 after the 14/11 move to Singapore,
 * and a colour photo uploaded 16/11 vanished after Save). R2 keeps
 * them outside the server, so a redeploy or region move can't lose
 * them. Only uploaded photos go to R2 — the 61 catalog photos that
 * ship with the code stay in public/products/ untouched.
 *
 * Config (Railway variables, all five required):
 * - R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT
 *   (https://<ACCOUNT_ID>.r2.cloudflarestorage.com)
 * - R2_PUBLIC_URL (the bucket's https://pub-....r2.dev URL, public
 *   access enabled on the bucket)
 *
 * When any variable is missing, R2 is treated as not configured and
 * every caller falls back to the old volume behaviour, so the shop
 * keeps working on a machine without R2 set up (local dev). Stored
 * paths keep the "/uploads/<file>" shape either way, so no product
 * data has to change: the upload route writes to R2 and returns the
 * same path, the serve route reads R2 when the volume has no copy,
 * and the save check looks the file up on R2.
 */
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

/** True only when all five R2 variables are set. */
export function r2Configured(): boolean {
  return (
    env("R2_BUCKET").length > 0 &&
    env("R2_ACCESS_KEY_ID").length > 0 &&
    env("R2_SECRET_ACCESS_KEY").length > 0 &&
    env("R2_ENDPOINT").length > 0 &&
    env("R2_PUBLIC_URL").length > 0
  );
}

/** Public URL of an object key, e.g. "anh-....jpg". */
export function r2PublicUrl(key: string): string | null {
  const base = env("R2_PUBLIC_URL");
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
}

function r2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: env("R2_ENDPOINT"),
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  });
}

/**
 * Store one resized photo in R2 under its plain filename. Throws on
 * failure — the caller must surface the error, not silently fall back
 * to the volume, or the file would be lost again on the next restart
 * and the save check (which looks on R2) would refuse the product.
 */
export async function r2Upload(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const client = r2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/**
 * True when the object exists in R2. Uses a HEAD request against the
 * public URL (no signing needed — the bucket's R2.dev access is
 * public), so a private-bucket misconfiguration shows up here as
 * "not found" instead of silently passing the save check.
 */
export async function r2Exists(key: string): Promise<boolean> {
  const url = r2PublicUrl(key);
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fetch one object's bytes from R2, or null when it isn't there. */
export async function r2Fetch(key: string): Promise<Buffer | null> {
  const url = r2PublicUrl(key);
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/** Read-only existence probe (HeadObject) for debugging/admin use. */
export async function r2Head(key: string): Promise<boolean> {
  try {
    await r2Client().send(
      new HeadObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }),
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete one object from R2. Returns false when R2 is not configured
 * or the delete fails — cleanup is best-effort and must never fail the
 * product save that triggered it. (S3 DeleteObject is idempotent, so
 * deleting a key that is already gone still counts as success.)
 */
export async function r2Delete(key: string): Promise<boolean> {
  if (!r2Configured()) return false;
  try {
    await r2Client().send(
      new DeleteObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }),
    );
    return true;
  } catch (error) {
    console.error(`Failed to delete ${key} from R2:`, error);
    return false;
  }
}
