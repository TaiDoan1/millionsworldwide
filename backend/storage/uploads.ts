/**
 * Product image uploads.
 *
 * Where images live, on purpose:
 * - The catalog photos that ship with the code live in public/products/
 *   and are deployed with each push.
 * - Photos the owner uploads from /mw-office live on the Railway
 *   volume (<DATA_DIR>/uploads) and are served by the
 *   app/uploads/[...path] route — so an upload shows on the web
 *   immediately, with no code push and no redeploy.
 * - The database stores ONLY the URL path ("/uploads/<file>" or
 *   "/products/<file>"), never the image bytes: bytes in Postgres
 *   would bloat the database and serve slowly for no benefit.
 */
import fs from "node:fs";
import path from "node:path";
import { dataDir } from "./file";

/** Uploaded files live under the data dir, next to orders/settings. */
export function uploadsDir(): string {
  return path.join(dataDir(), "uploads");
}

/** Uploaded images are capped at 5MB — the route also resizes them. */
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

/** Accepted image types: the extension for the filename + sharp's format. */
export const ALLOWED_UPLOAD_TYPES: Record<
  string,
  { ext: string; format: "jpeg" | "png" | "webp" }
> = {
  "image/jpeg": { ext: "jpg", format: "jpeg" },
  "image/png": { ext: "png", format: "png" },
  "image/webp": { ext: "webp", format: "webp" },
};

/**
 * Unique, readable filename: slug of the original name + a timestamp
 * and random tail, so two uploads never overwrite each other.
 */
export function makeUploadFileName(
  originalName: string,
  ext: string,
): string {
  const base = (originalName.split(".").slice(0, -1).join(".") || "anh")
    .toLowerCase()
    .replace(/đ/g, "d") // NFD does not decompose đ, so map it by hand.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const stamp = Date.now().toString(36);
  const tail = Math.random().toString(36).slice(2, 6);
  return `${base || "anh"}-${stamp}-${tail}.${ext}`;
}

/**
 * Resolve a stored "/uploads/<file>" path to its file on the volume.
 * Returns null for anything outside /uploads/ or escaping it — the
 * serve route never reads outside the uploads directory.
 */
export function resolveUploadPath(src: string): string | null {
  if (!src.startsWith("/uploads/")) return null;
  const rest = src.slice("/uploads/".length);
  if (!rest || rest.includes("..")) return null;
  const dir = path.resolve(uploadsDir());
  const file = path.resolve(dir, rest);
  if (file !== dir && !file.startsWith(dir + path.sep)) return null;
  return file;
}

/**
 * True when a catalog image path has a file behind it: under public/
 * for the photos that ship with the code, or on the volume for
 * photos uploaded from /mw-office. The admin save refuses paths
 * with no file behind them, so the shop never renders a broken card.
 */
export function imageFileExists(src: string): boolean {
  if (src.startsWith("/uploads/")) {
    const file = resolveUploadPath(src);
    return file !== null && fs.existsSync(file);
  }
  if (!src.startsWith("/") || src.includes("..")) return false;
  return fs.existsSync(path.join(process.cwd(), "public", src));
}
