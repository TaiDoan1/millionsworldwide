import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin gate — Next.js 16 "proxy" convention (middleware.ts is deprecated).
 *
 * /admin lists orders with customer names, phones and addresses, so it is
 * locked behind HTTP Basic Auth. Credentials come only from the
 * ADMIN_USER / ADMIN_PASS environment variables, never from code.
 *
 * Behaviour:
 * - Local dev without credentials stays open for convenience.
 * - Production without credentials is fail-closed: /admin answers 401
 *   until ADMIN_USER / ADMIN_PASS are set on the host.
 * - Authenticated responses carry X-Robots-Tag so /admin is never indexed.
 *
 * This is the outer gate only. The settings mutation double-checks the
 * same credentials inside its server action (app/lib/admin-auth.ts), so
 * a proxy misconfiguration alone cannot open the admin write path.
 */

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function unauthorized(message: string): Response {
  return new Response(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Millions Admin", charset="UTF-8"',
    },
  });
}

export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!pass && process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }
  if (!user || !pass) {
    return unauthorized(
      "Admin chưa được cấu hình: thiếu ADMIN_USER / ADMIN_PASS."
    );
  }

  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) {
    return unauthorized("Cần đăng nhập để vào trang quản trị.");
  }
  let decoded = "";
  try {
    decoded = Buffer.from(header.slice("Basic ".length), "base64").toString(
      "utf-8"
    );
  } catch {
    return unauthorized("Thông tin đăng nhập không hợp lệ.");
  }
  const sep = decoded.indexOf(":");
  const ok =
    sep >= 0 &&
    timingSafeEqual(decoded.slice(0, sep), user) &&
    timingSafeEqual(decoded.slice(sep + 1), pass);
  if (!ok) {
    return unauthorized("Sai tài khoản hoặc mật khẩu quản trị.");
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
