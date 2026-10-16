"use server"

import fs from "fs/promises"
import path from "path"
import { revalidatePath } from "next/cache"

const settingsFilePath = path.join(process.cwd(), "app/data/settings.json")

export type Settings = {
  bannerSize: "full" | "large" | "medium";
  textColor: "white" | "black";
  comingSoonEnabled: boolean;
  launchDate: string;
  comingSoonTitle?: string;
  comingSoonSubtitle?: string;
}

export async function getSettings(): Promise<Settings> {
  try {
    const data = await fs.readFile(settingsFilePath, "utf-8")
    const parsed = JSON.parse(data)
    return {
      bannerSize: parsed.bannerSize || "full",
      textColor: parsed.textColor || "white",
      comingSoonEnabled: parsed.comingSoonEnabled ?? true,
      launchDate: parsed.launchDate || "2026-11-01T00:00:00",
      comingSoonTitle: parsed.comingSoonTitle || "THE OFFICIAL LAUNCH",
      comingSoonSubtitle: parsed.comingSoonSubtitle || "MILLIONS IS BUILT FOR THOSE WHO CHOOSE FORM OVER NOISE",
    }
  } catch (error) {
    return {
      bannerSize: "full",
      textColor: "white",
      comingSoonEnabled: true,
      launchDate: "2026-11-01T00:00:00",
      comingSoonTitle: "THE OFFICIAL LAUNCH",
      comingSoonSubtitle: "MILLIONS IS BUILT FOR THOSE WHO CHOOSE FORM OVER NOISE",
    }
  }
}

export async function updateSettings(newSettings: Settings) {
  try {
    await fs.mkdir(path.dirname(settingsFilePath), { recursive: true })
    await fs.writeFile(settingsFilePath, JSON.stringify(newSettings, null, 2), "utf-8")
    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Failed to save settings:", error)
    return { success: false, error: "Failed to save settings" }
  }
}
