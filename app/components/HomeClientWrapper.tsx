"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Settings } from "../actions/settings"
import ComingSoon from "./ComingSoon"
import WelcomeIntro from "./WelcomeIntro"
import InstagramSection from "./InstagramSection"
import SiteFooter from "./SiteFooter"
import HeroSection from "../features/home/HeroSection"
import MarqueeBar from "../features/home/MarqueeBar"
import StoryTiles from "../features/home/StoryTiles"
import EditorialSection from "../features/home/EditorialSection"
import ArrivalsSection from "../features/home/ArrivalsSection"

interface HomeClientWrapperProps {
  settings: Settings
}

/**
 * Homepage assembly: Coming Soon gate + preview banner + the home
 * sections (each lives in features/home so this file stays thin).
 */
export default function HomeClientWrapper({ settings }: HomeClientWrapperProps) {
  const [isPreviewing, setIsPreviewing] = useState(false)
  // Auto-open the site once the configured launch moment ("Thời gian mở web"
  // in /admin) has passed. Mount-guarded so the server render and the first
  // client render stay identical (no hydration mismatch).
  const [launched, setLaunched] = useState(false)
  useEffect(() => {
    if (!settings.launchDate) return
    const target = new Date(settings.launchDate).getTime()
    if (Number.isNaN(target) || Date.now() < target) return
    // Deferred a tick so this is not a synchronous setState in the effect.
    const timer = window.setTimeout(() => setLaunched(true), 0)
    return () => window.clearTimeout(timer)
  }, [settings.launchDate])

  // Coming Soon gate: shown only while Coming Soon mode is on, not previewing,
  // and the launch moment has not arrived yet
  if (settings.comingSoonEnabled && !isPreviewing && !launched) {
    return (
      <ComingSoon
        launchDate={settings.launchDate}
        title={settings.comingSoonTitle}
        subtitle={settings.comingSoonSubtitle}
        onPreviewClick={() => setIsPreviewing(true)}
      />
    )
  }

  return (
    <main className="w-full min-h-screen relative bg-white text-black">
      {/* Welcome screen — homepage only, once per session */}
      <WelcomeIntro />
      {/* PREVIEW BANNER (When Coming Soon is enabled but admin clicked Preview) */}
      {settings.comingSoonEnabled && isPreviewing && (
        <div className="fixed top-0 left-0 right-0 z-[120] bg-black/90 text-white px-4 py-2 text-xs flex items-center justify-between backdrop-blur-md border-b border-white/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold tracking-wider uppercase text-[11px]">
              Chế độ xem trước (Khách hàng vẫn thấy màn hình Coming Soon)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="underline hover:text-gray-300 text-[11px] uppercase tracking-wider">
              Cài đặt Admin
            </Link>
            <button
              onClick={() => setIsPreviewing(false)}
              className="bg-white text-black px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase hover:bg-neutral-200 transition-colors"
            >
              Về màn hình Coming Soon
            </button>
          </div>
        </div>
      )}

      <HeroSection />
      <MarqueeBar />
      <StoryTiles />
      <EditorialSection />
      <ArrivalsSection />

      <InstagramSection />
      <SiteFooter />
    </main>
  )
}
