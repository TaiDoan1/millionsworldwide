"use server";

// Thin transport layer: the real settings logic lives in
// backend/services/settings.ts.
import {
  getSettings as getSettingsService,
  updateSettings as updateSettingsService,
} from "../../backend/services/settings";
import type { Settings } from "../../backend/services/settings";

export type { Settings };

export async function getSettings(): Promise<Settings> {
  return getSettingsService();
}

export async function updateSettings(newSettings: Settings) {
  return updateSettingsService(newSettings);
}
