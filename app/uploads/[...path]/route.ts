import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { resolveUploadPath } from "../../../backend/storage/uploads";
import { r2Configured, r2Fetch } from "../../../backend/storage/r2";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * GET /uploads/<file> — serves a photo the owner uploaded from
 * /mw-office. Public on purpose: these are product photos. The
 * path is resolved strictly inside the uploads directory, so no
 * request can read anything else on disk. The volume copy is tried
 * first; when it is gone (or the photo was uploaded straight to R2)
 * the bytes come from R2 instead, so one "/uploads/<file>" path
 * keeps working across the move.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const key = path.join("/");
  if (!key || key.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }
  const file = resolveUploadPath(`/uploads/${key}`);
  if (file) {
    try {
      const data = await fs.readFile(file);
      return serveImage(data, file);
    } catch {
      // No volume copy — fall through to R2 below.
    }
  }
  if (r2Configured()) {
    const data = await r2Fetch(key);
    if (data) return serveImage(data, key);
  }
  return new NextResponse("Not found", { status: 404 });
}

function serveImage(data: Buffer, file: string): NextResponse {
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      // Filenames are unique per upload, so a cached copy is final.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
