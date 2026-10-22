"use server";

import { addSubscriber, listSubscribers } from "../lib/storage";

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
