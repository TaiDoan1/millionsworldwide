import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { isAdminRequest } from "../../../../backend/auth/admin-auth";
import {
  ALLOWED_UPLOAD_TYPES,
  makeUploadFileName,
  UPLOAD_MAX_BYTES,
  uploadsDir,
} from "../../../../backend/storage/uploads";
import { r2Configured, r2Upload } from "../../../../backend/storage/r2";
import { postgresConfigured } from "../../../../backend/storage/postgres";
import { saveDbImage } from "../../../../backend/storage/db-images";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/upload — one product photo from /mw-office.
 *
 * Admin-only (the same Basic Auth check as the admin mutations — the
 * browser sends the saved login automatically on this origin). The
 * file is validated (type + 5MB), resized to at most 1200px wide so
 * a phone photo doesn't ship at full size, and stored on R2 when it
 * is configured (Cloudflare R2, bucket millions-images) — or in
 * Postgres when that is configured (temporary: the Railway volume
 * kept losing uploads) — or on the Railway volume when neither is;
 * only its URL path is returned — the caller saves that path on the
 * product, and the photo shows on the web immediately.
 */
export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json(
      { error: "Không có quyền tải ảnh lên." },
      { status: 401 },
    );
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Không đọc được file gửi lên." },
      { status: 400 },
    );
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Chưa chọn file ảnh." },
      { status: 400 },
    );
  }
  const kind = ALLOWED_UPLOAD_TYPES[file.type];
  if (!kind) {
    return NextResponse.json(
      { error: "Chỉ nhận ảnh jpg, png hoặc webp." },
      { status: 400 },
    );
  }
  const input = Buffer.from(await file.arrayBuffer());
  if (input.length === 0 || input.length > UPLOAD_MAX_BYTES) {
    return NextResponse.json(
      { error: "Ảnh phải từ 1 byte đến 5MB." },
      { status: 400 },
    );
  }
  // Resize to web size; a resize failure keeps the original bytes —
  // the upload still succeeds instead of failing on a valid photo.
  let output = input;
  try {
    const sharp = (await import("sharp")).default;
    output = await sharp(input)
      .resize({ width: 1200, withoutEnlargement: true })
      .toFormat(kind.format)
      .toBuffer();
  } catch {
    output = input;
  }
  const name = makeUploadFileName(file.name, kind.ext);
  // R2 when configured: the photo leaves the server entirely, so a
  // redeploy or region move can't lose it the way the volume did
  // (33 uploaded images, 15/11). The returned path keeps the
  // "/uploads/<file>" shape, so no product data has to change.
  // An R2 failure is reported, never silently written to the volume:
  // a volume copy would be lost again and the save check (which
  // looks on R2) would refuse the product.
  if (r2Configured()) {
    try {
      await r2Upload(name, output, file.type);
    } catch (error) {
      console.error("Failed to upload image to R2:", error);
      return NextResponse.json(
        { error: "Không up được ảnh lên R2, thử lại nhé." },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: `/uploads/${name}` });
  }
  // Temporary durable store (19/11): when Postgres is configured the
  // bytes go there — the volume has lost every uploaded photo so far
  // (all 57 /uploads/ paths 404), and a volume copy would pass the
  // save check only to vanish again on the next deploy. A DB failure
  // is reported, never silently written to the volume. When R2 is
  // configured the R2 branch above takes over and this never runs.
  if (postgresConfigured()) {
    try {
      await saveDbImage(name, output, file.type);
    } catch (error) {
      console.error("Failed to save uploaded image to Postgres:", error);
      return NextResponse.json(
        { error: "Không lưu được ảnh, thử lại nhé." },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: `/uploads/${name}` });
  }
  const dir = uploadsDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), output);
  return NextResponse.json({ url: `/uploads/${name}` });
}
