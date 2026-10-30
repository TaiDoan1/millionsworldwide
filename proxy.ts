import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin gate — Next.js 16 "proxy" convention (middleware.ts is deprecated).
 *
 * /mw-office lists orders with customer names, phones and addresses, so it is
 * locked behind HTTP Basic Auth. Credentials come only from the
 * ADMIN_USER / ADMIN_PASS environment variables, never from code.
 *
 * Behaviour:
 * - Local dev without credentials stays open for convenience.
 * - Production without credentials is fail-closed: /mw-office answers 401
 *   until ADMIN_USER / ADMIN_PASS are set on the host.
 * - Authenticated responses carry X-Robots-Tag so /mw-office is never indexed.
 * - /previewsite and /riviewsite are gated too: they bypass the Coming Soon
 *   gate by design, so they must never be public.
 *
 * This is the outer gate only. The settings mutation double-checks the
 * same credentials inside its server action (backend/services/settings.ts
 * via backend/auth), so a proxy misconfiguration alone cannot open the
 * admin write path.
 */

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Brute-force brake: 10 failed admin logins per IP per 15 minutes.
 * A correct password always gets through (and clears the counter) so the
 * shop owner can never lock themselves out by mistyping.
 */
const MAX_FAILURES = 10;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;

const failures = new Map<string, { count: number; until: number }>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

function recordFailure(ip: string): number {
  const now = Date.now();
  if (failures.size > 1000) {
    for (const [k, v] of failures) {
      if (now >= v.until) failures.delete(k);
    }
  }
  const entry = failures.get(ip);
  if (!entry || now >= entry.until) {
    failures.set(ip, { count: 1, until: now + FAILURE_WINDOW_MS });
    return 1;
  }
  entry.count += 1;
  return entry.count;
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
  if (ok) {
    failures.delete(clientIp(request));
  } else {
    const count = recordFailure(clientIp(request));
    if (count >= MAX_FAILURES) {
      return new Response(
        "Sai mật khẩu quá nhiều lần. Thử lại sau 15 phút.",
        { status: 429 }
      );
    }
    return unauthorized("Sai tài khoản hoặc mật khẩu quản trị.");
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/mw-office/:path*", "/previewsite/:path*", "/riviewsite/:path*"],
};
