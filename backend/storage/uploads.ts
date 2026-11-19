/**
 * Product image uploads.
 *
 * Where images live, on purpose:
 * - The catalog photos that ship with the code live in public/products/
 *   and are deployed with each push.
 * - Photos the owner uploads from /mw-office live on the Railway
 *   volume (<DATA_DIR>/uploads) and are served by the
 *   app/uploads/[...path] route — so an upload shows on the web
 *   immediately, with no code push and no redeploy. When R2 is
 *   configured (backend/storage/r2.ts) new uploads go to R2 instead
 *   — the volume kept losing them — and the serve route reads R2
 *   when the volume has no copy. Until R2 is configured, new
 *   uploads are saved in Postgres instead
 *   (backend/storage/db-images.ts) — the volume lost every uploaded
 *   photo by 19/11 — and the serve route reads the database when
 *   the volume has no copy. Either way the stored path keeps the
 *   "/uploads/<file>" shape.
 * - The database stores ONLY the URL path ("/uploads/<file>" or
 *   "/products/<file>"), never the image bytes: bytes in Postgres
 *   would bloat the database and serve slowly for no benefit. The
 *   one exception is the temporary uploaded_images table above,
 *   which holds bytes only until R2 takes over.
 */
import fs from "node:fs";
import path from "node:path";
import { dataDir } from "./file";
import { dbImageExists } from "./db-images";
import { r2Configured, r2Exists, r2PublicUrl } from "./r2";

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
 *
 * Kept synchronous for the volume/public cases. Use
 * imageFileExistsAsync for the save check — it also looks the file
 * up on R2 when the volume has no copy.
 */
export function imageFileExists(src: string): boolean {
  if (src.startsWith("/uploads/")) {
    const file = resolveUploadPath(src);
    return file !== null && fs.existsSync(file);
  }
  if (!src.startsWith("/") || src.includes("..")) return false;
  return fs.existsSync(path.join(process.cwd(), "public", src));
}

/**
 * Async version of the save check: "/uploads/<file>" counts when the
 * file is on the volume OR in the temporary Postgres store OR in R2
 * (when R2 is configured), and a full R2 public URL counts when that
 * object exists. A file that exists nowhere still fails, so a product
 * can never be saved pointing at a photo that was lost — the same
 * rule that caught the 33 broken images, now looking in the database
 * too. A database outage is treated as "not in the database" (and
 * logged) so it cannot block a save for a photo that lives on the
 * volume or R2.
 */
export async function imageFileExistsAsync(src: string): Promise<boolean> {
  if (src.startsWith("/uploads/")) {
    if (imageFileExists(src)) return true;
    try {
      if (await dbImageExists(src.slice("/uploads/".length))) return true;
    } catch (error) {
      console.error(
        "Failed to check uploaded image in Postgres:",
        error,
      );
    }
    if (!r2Configured()) return false;
    return r2Exists(src.slice("/uploads/".length));
  }
  const publicUrl = r2PublicUrl("");
  if (
    publicUrl &&
    src.startsWith(publicUrl) &&
    !src.includes("..")
  ) {
    return r2Exists(src.slice(publicUrl.length));
  }
  if (!src.startsWith("/") || src.includes("..")) return false;
  return fs.existsSync(path.join(process.cwd(), "public", src));
}
