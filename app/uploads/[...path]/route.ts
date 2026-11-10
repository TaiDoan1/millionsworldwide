import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { resolveUploadPath } from "../../../backend/storage/uploads";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * GET /uploads/<file> — serves a photo the owner uploaded from
 * /mw-office, straight from the Railway volume. Public on purpose:
 * these are product photos. The path is resolved strictly inside the
 * uploads directory, so no request can read anything else on disk.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const file = resolveUploadPath(`/uploads/${path.join("/")}`);
  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const data = await fs.readFile(file);
    const ext = file.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(data, {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        // Filenames are unique per upload, so a cached copy is final.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
