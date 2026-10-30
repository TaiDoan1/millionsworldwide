"use server";

// Thin transport layer: the real signup logic lives in
// backend/services/subscribers.ts.
import {
  getSubscribers as getSubscribersService,
  subscribeEmail as subscribeEmailService,
} from "../../backend/services/subscribers";
import type { Subscriber } from "../../backend/services/subscribers";

export type { Subscriber };

export async function getSubscribers() {
  return getSubscribersService();
}

export async function subscribeEmail(
  email: string,
  source: string
): Promise<{ success: boolean; duplicate?: boolean }> {
  return subscribeEmailService(email, source);
}
