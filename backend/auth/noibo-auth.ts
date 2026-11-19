/**
 * Cookie sessions for the internal staff pages (/noibo).
 *
 * Staff log in with their own username + password (checked in
 * backend/services/noibo.ts). A successful login creates a random
 * token: the raw token lives only in an httpOnly cookie scoped to
 * /noibo, and only its SHA-256 is stored in noibo_sessions. Sessions
 * last 30 days; deleting the row (logout, password reset) logs the
 * staff member out everywhere at once.
 *
 * This is deliberately separate from the shop admin Basic Auth
 * (/mw-office): the two gates never share credentials or cookies.
 */
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { getSessionStaff } from "../storage/noibo";
import type { NoiboStaff } from "../storage/types";

export const NOIBO_SESSION_COOKIE = "mw-noibo-session";

/** Session lifetime: 30 days. */
export const NOIBO_SESSION_DAYS = 30;

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getNoiboSessionStaff(): Promise<NoiboStaff | null> {
  let token: string | undefined;
  try {
    token = (await cookies()).get(NOIBO_SESSION_COOKIE)?.value;
  } catch {
    return null;
  }
  if (!token) return null;
  try {
    const staff = await getSessionStaff(hashSessionToken(token));
    if (!staff || !staff.active) return null;
    return staff;
  } catch (error) {
    console.error("[noibo] Failed to read session:", error);
    return null;
  }
}

export async function setNoiboSessionCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const store = await cookies();
  store.set(NOIBO_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/noibo",
    expires: expiresAt,
  });
}

export async function clearNoiboSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(NOIBO_SESSION_COOKIE);
}

export async function readNoiboSessionToken(): Promise<string | null> {
  try {
    return (await cookies()).get(NOIBO_SESSION_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}
