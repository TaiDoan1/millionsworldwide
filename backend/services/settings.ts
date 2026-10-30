/** Backend service: site settings (defaults merge, admin-guarded writes). Called only via app/actions/settings.ts. */
import { revalidatePath } from "next/cache"
import { readSettings, writeSettings } from "../storage"
import { isAdminRequest } from "../auth/admin-auth"

export type { Settings } from "../storage/types";
import type { Settings } from "../storage/types"

const DEFAULTS: Settings = {
  bannerSize: "full",
  textColor: "white",
  comingSoonEnabled: true,
  launchDate: "2026-11-01T00:00:00",
  comingSoonTitle: "THE OFFICIAL LAUNCH",
  comingSoonSubtitle: "MILLIONS IS BUILT FOR THOSE WHO CHOOSE FORM OVER NOISE",
}

export async function getSettings(): Promise<Settings> {
  try {
    const stored = await readSettings()
    if (!stored) return { ...DEFAULTS }
    return {
      bannerSize: stored.bannerSize || DEFAULTS.bannerSize,
      textColor: stored.textColor || DEFAULTS.textColor,
      comingSoonEnabled: stored.comingSoonEnabled ?? DEFAULTS.comingSoonEnabled,
      launchDate: stored.launchDate || DEFAULTS.launchDate,
      comingSoonTitle: stored.comingSoonTitle || DEFAULTS.comingSoonTitle,
      comingSoonSubtitle: stored.comingSoonSubtitle || DEFAULTS.comingSoonSubtitle,
    }
  } catch (error) {
    console.error("Failed to read settings:", error)
    return { ...DEFAULTS }
  }
}

export async function updateSettings(newSettings: Settings) {
  // Second gate behind the proxy: a proxy misconfiguration must never
  // silently open the settings write path.
  if (!(await isAdminRequest())) {
    return { success: false, error: "Không có quyền thay đổi cài đặt." }
  }
  try {
    await writeSettings(newSettings)
    revalidatePath("/")
    revalidatePath("/mw-office")
    return { success: true }
  } catch (error) {
    console.error("Failed to save settings:", error)
    return { success: false, error: "Failed to save settings" }
  }
}
