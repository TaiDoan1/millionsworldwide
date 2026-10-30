"use server";

import { addSubscriber, listSubscribers } from "../lib/storage";
import { checkRateLimit, clientKey } from "../lib/rate-limit";

export type { Subscriber } from "../lib/storage/types";

export async function getSubscribers() {
  return listSubscribers();
}

/**
 * Store an email signup (notify-me form, newsletter, ...).
 * Duplicates are ignored. Returns success even if the write fails so the
 * visitor experience never breaks; failures are logged server-side.
 */
export async function subscribeEmail(
  email: string,
  source: string
): Promise<{ success: boolean; duplicate?: boolean }> {
  // Signup spam guard: 10 signups per 10 minutes per IP.
  if (!checkRateLimit(await clientKey("subscribe"), 10, 10 * 60 * 1000)) {
    return { success: false };
  }
  const cleaned = (email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    return { success: false };
  }
  try {
    const result = await addSubscriber({
      email: cleaned,
      source: source || "site",
      at: new Date().toISOString(),
    });
    return result === "duplicate"
      ? { success: true, duplicate: true }
      : { success: true };
  } catch (error) {
    console.error("Failed to store subscriber:", error);
    return { success: true };
  }
}
