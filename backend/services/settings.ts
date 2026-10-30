/** Backend service: site settings (defaults merge, admin-guarded writes). Called only via app/actions/settings.ts. */
import { revalidatePath } from "next/cache"
import { readSettings, writeSettings } from "../storage"
import { isAdminRequest } from "../auth/admin-auth"
import { validateSettings } from "./settings-validation"

export type { Settings } from "../storage/types";
import type { Settings } from "../storage/types"

const DEFAULTS: Settings = {
  // The shop is live and the repo seed already says false: a settings
  // read failure must never re-hide the live shop behind Coming Soon.
  // (Order writes still fail loudly without a database; only browsing
  // stays open.)
  comingSoonEnabled: false,
  launchDate: "2026-11-01T00:00:00",
  comingSoonTitle: "THE OFFICIAL LAUNCH",
  comingSoonSubtitle: "MILLIONS IS BUILT FOR THOSE WHO CHOOSE FORM OVER NOISE",
  promoEnabled: false,
  promoText: "",
  promoLink: "",
  marqueeText: "",
  editorialHeading: "",
  editorialText: "",
}

export async function getSettings(): Promise<Settings> {
  try {
    const stored = await readSettings()
    if (!stored) return { ...DEFAULTS }
    return {
      comingSoonEnabled: stored.comingSoonEnabled ?? DEFAULTS.comingSoonEnabled,
      launchDate: stored.launchDate || DEFAULTS.launchDate,
      comingSoonTitle: stored.comingSoonTitle || DEFAULTS.comingSoonTitle,
      comingSoonSubtitle: stored.comingSoonSubtitle || DEFAULTS.comingSoonSubtitle,
      promoEnabled: stored.promoEnabled ?? DEFAULTS.promoEnabled,
      promoText: stored.promoText ?? DEFAULTS.promoText,
      promoLink: stored.promoLink ?? DEFAULTS.promoLink,
      marqueeText: stored.marqueeText ?? DEFAULTS.marqueeText,
      editorialHeading: stored.editorialHeading ?? DEFAULTS.editorialHeading,
      editorialText: stored.editorialText ?? DEFAULTS.editorialText,
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
  // Whitelist check: never persist a malformed settings object, or one bad
  // admin save could break the homepage gate for every visitor.
  const invalid = validateSettings(newSettings)
  if (invalid) {
    return { success: false, error: invalid }
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
