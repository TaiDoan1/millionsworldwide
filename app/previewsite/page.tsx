import Link from "next/link"
import { getSettings } from "../actions/settings"
import HomeClientWrapper from "../components/HomeClientWrapper"

export const metadata = {
  title: "Preview Site — MILLIONS WORLDWIDE",
  robots: "noindex, nofollow",
}

export default async function PreviewSitePage() {
  const settings = await getSettings()

  // In preview mode, force comingSoonEnabled to false so the full website is rendered
  const previewSettings = {
    ...settings,
    comingSoonEnabled: false,
  }

  return (
    <div className="relative">
      {/* Top Admin / Preview Notification Bar */}
      <div className="sticky top-0 left-0 right-0 z-[120] bg-black text-white px-6 py-2.5 text-xs flex items-center justify-between border-b border-white/20 shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold tracking-widest uppercase text-[10px] md:text-xs text-white">
            CHẾ ĐỘ XEM TRƯỚC (PREVIEW SITE)
          </span>
          <span className="hidden sm:inline text-white/50 text-[10px]">
            — Khách bình thường chỉ thấy màn hình Coming Soon
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/mw-office"
            className="text-[10px] font-bold tracking-widest uppercase bg-white/10 hover:bg-white hover:text-black transition-colors px-3 py-1 rounded-sm"
          >
            Quản trị Admin &rarr;
          </Link>
          <Link
            href="/"
            className="text-[10px] font-bold tracking-widest uppercase text-white/70 hover:text-white underline underline-offset-4"
          >
            Về Coming Soon
          </Link>
        </div>
      </div>

      {/* Full Website Content */}
      <HomeClientWrapper settings={previewSettings} />
    </div>
  )
}
