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

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/upload — one product photo from /mw-office.
 *
 * Admin-only (the same Basic Auth check as the admin mutations — the
 * browser sends the saved login automatically on this origin). The
 * file is validated (type + 5MB), resized to at most 1200px wide so
 * a phone photo doesn't ship at full size, and stored on the Railway
 * volume; only its URL path is returned — the caller saves that path
 * on the product, and the photo shows on the web immediately.
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
  const dir = uploadsDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), output);
  return NextResponse.json({ url: `/uploads/${name}` });
}
