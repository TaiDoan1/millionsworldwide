"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

interface ComingSoonProps {
  launchDate?: string
  title?: string
  subtitle?: string
  showSecretLinks?: boolean
  onPreviewClick?: () => void
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export default function ComingSoon({
  launchDate = "2026-11-01T00:00:00",
  title = "THE OFFICIAL LAUNCH",
  subtitle = "MILLIONS IS BUILT FOR THOSE WHO CHOOSE FORM OVER NOISE",
  showSecretLinks = false,
  onPreviewClick,
}: ComingSoonProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })
  const [isMuted, setIsMuted] = useState(true)
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  const desktopVideoRef = useRef<HTMLVideoElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)

  // Track viewport to only play ONE video at a time (prevent overlapping sounds)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    setIsDesktop(mq.matches)

    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Calculate remaining time
  useEffect(() => {
    setMounted(true)

    const calculateTime = () => {
      const targetTime = new Date(launchDate).getTime()
      const now = new Date().getTime()
      const diff = targetTime - now

      if (isNaN(targetTime) || diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      })
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)

    return () => clearInterval(timer)
  }, [launchDate])

  // Synchronize playback and muting strictly to the ACTIVE video
  useEffect(() => {
    if (isDesktop) {
      // Inactive: pause and mute mobile video
      if (mobileVideoRef.current) {
        mobileVideoRef.current.pause()
        mobileVideoRef.current.muted = true
      }
      // Active: play desktop video with selected mute state
      if (desktopVideoRef.current) {
        desktopVideoRef.current.muted = isMuted
        desktopVideoRef.current.play().catch(() => {})
      }
    } else {
      // Inactive: pause and mute desktop video
      if (desktopVideoRef.current) {
        desktopVideoRef.current.pause()
        desktopVideoRef.current.muted = true
      }
      // Active: play mobile video with selected mute state
      if (mobileVideoRef.current) {
        mobileVideoRef.current.muted = isMuted
        mobileVideoRef.current.play().catch(() => {})
      }
    }
  }, [isDesktop, isMuted])

  // Sound toggle handler
  const toggleSound = () => {
    setIsMuted((prev) => !prev)
  }

  // Handle email submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsSubscribed(true)
  }

  const formatNumber = (num: number) => String(num).padStart(2, "0")

  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-black text-white overflow-hidden flex flex-col justify-between select-none">
      {/* Background Videos: Desktop & Mobile */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Desktop Video (md and up) */}
        <video
          ref={desktopVideoRef}
          src="/videos/desktop.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="hidden md:block w-full h-full object-cover object-center"
        />

        {/* Mobile Video (below md) */}
        <video
          ref={mobileVideoRef}
          src="/videos/mobile.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="block md:hidden w-full h-full object-cover object-center"
        />

        {/* CINEMATIC SUBTLE BOTTOM GRADIENT (Leaves center 100% clear for the video) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent h-1/2 mt-auto pointer-events-none" />
      </div>

      {/* TOP HEADER */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 md:py-8">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase text-white/90">
            Coming Soon
          </span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.png"
            alt="MILLIONS"
            width={34}
            height={26}
            className="h-6 md:h-7 w-auto object-contain drop-shadow"
            priority
          />
          <span className="text-sm md:text-base font-bold tracking-[0.25em] uppercase">
            Millions
          </span>
        </Link>

        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          type="button"
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[10px] md:text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
          title={isMuted ? "Unmute Video" : "Mute Video"}
        >
          {isMuted ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
              <span className="hidden sm:inline">Sound Off</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              <span className="hidden sm:inline">Sound On</span>
            </>
          )}
        </button>
      </header>

      {/* CENTER EMPTY: Intentionally clear so the animated video is 100% visible */}
      <div className="flex-1 pointer-events-none" />

      {/* BOTTOM SECTION: Compact countdown timer positioned low above footer */}
      <main className="relative z-20 flex flex-col items-center justify-end px-4 md:px-8 text-center pb-2">
        {/* COUNTDOWN TIMER */}
        {mounted && !timeLeft.isExpired ? (
          <div className="mb-3">
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
              {/* Days */}
              <div className="flex flex-col items-center">
                <div className="w-13 sm:w-16 md:w-18 h-12 sm:h-14 md:h-16 bg-black/60 border border-white/20 backdrop-blur-md rounded-md flex items-center justify-center shadow-2xl">
                  <span className="text-lg sm:text-2xl md:text-3xl font-bold font-mono tracking-tight text-white">
                    {formatNumber(timeLeft.days)}
                  </span>
                </div>
                <span className="mt-1 text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.25em] font-semibold text-white/70 uppercase">
                  Days
                </span>
              </div>

              <span className="text-lg sm:text-xl md:text-2xl font-light text-white/40 pb-3 animate-pulse">
                :
              </span>

              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="w-13 sm:w-16 md:w-18 h-12 sm:h-14 md:h-16 bg-black/60 border border-white/20 backdrop-blur-md rounded-md flex items-center justify-center shadow-2xl">
                  <span className="text-lg sm:text-2xl md:text-3xl font-bold font-mono tracking-tight text-white">
                    {formatNumber(timeLeft.hours)}
                  </span>
                </div>
                <span className="mt-1 text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.25em] font-semibold text-white/70 uppercase">
                  Hours
                </span>
              </div>

              <span className="text-lg sm:text-xl md:text-2xl font-light text-white/40 pb-3 animate-pulse">
                :
              </span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="w-13 sm:w-16 md:w-18 h-12 sm:h-14 md:h-16 bg-black/60 border border-white/20 backdrop-blur-md rounded-md flex items-center justify-center shadow-2xl">
                  <span className="text-lg sm:text-2xl md:text-3xl font-bold font-mono tracking-tight text-white">
                    {formatNumber(timeLeft.minutes)}
                  </span>
                </div>
                <span className="mt-1 text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.25em] font-semibold text-white/70 uppercase">
                  Mins
                </span>
              </div>

              <span className="text-lg sm:text-xl md:text-2xl font-light text-white/40 pb-3 animate-pulse">
                :
              </span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="w-13 sm:w-16 md:w-18 h-12 sm:h-14 md:h-16 bg-black/60 border border-white/20 backdrop-blur-md rounded-md flex items-center justify-center shadow-2xl">
                  <span className="text-lg sm:text-2xl md:text-3xl font-bold font-mono tracking-tight text-white">
                    {formatNumber(timeLeft.seconds)}
                  </span>
                </div>
                <span className="mt-1 text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.25em] font-semibold text-white/70 uppercase">
                  Secs
                </span>
              </div>
            </div>
          </div>
        ) : mounted && timeLeft.isExpired ? (
          <div className="mb-3 p-3 bg-white/10 backdrop-blur-md border border-white/30 rounded">
            <p className="text-xs md:text-sm font-bold tracking-widest uppercase mb-2">
              THE DROP IS NOW LIVE
            </p>
            {onPreviewClick ? (
              <button
                onClick={onPreviewClick}
                className="bg-white text-black px-5 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all"
              >
                ENTER STORE &rarr;
              </button>
            ) : (
              <Link
                href="/shop"
                className="inline-block bg-white text-black px-5 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all"
              >
                ENTER STORE &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="h-12 flex items-center justify-center mb-2">
            <span className="text-[10px] tracking-widest uppercase text-white/40">Loading timer...</span>
          </div>
        )}

        {/* NOTIFY ME EMAIL FORM: Minimal & sleek */}
        <div className="w-full max-w-xs">
          {isSubscribed ? (
            <div className="py-2 px-3 bg-black/60 backdrop-blur-md border border-white/20 rounded text-center">
              <p className="text-[10px] font-bold tracking-wider uppercase text-white">
                ✓ You are on the VIP list
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex gap-1.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL FOR EARLY ACCESS"
                required
                className="flex-1 bg-black/50 border border-white/20 px-3 py-1.5 text-[10px] text-white placeholder-white/50 focus:outline-none focus:border-white tracking-wider uppercase rounded-sm backdrop-blur-md"
              />
              <button
                type="submit"
                className="bg-white text-black px-3.5 py-1.5 text-[10px] font-bold tracking-wider uppercase hover:bg-neutral-200 transition-colors whitespace-nowrap rounded-sm"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 flex flex-col sm:flex-row items-center justify-between px-6 md:px-12 py-3.5 text-[10px] md:text-xs font-medium tracking-widest uppercase text-white/60 gap-2 sm:gap-0">
        <div>
          <span>&copy; {new Date().getFullYear()} Millions Worldwide</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Instagram ↗
          </a>
          <span className="text-white/20">|</span>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Facebook ↗
          </a>
          {showSecretLinks && (
            <>
              <span className="text-white/20">|</span>
              <Link href="/admin" className="hover:text-white transition-colors">
                Admin
              </Link>
              {onPreviewClick && (
                <>
                  <span className="text-white/20">|</span>
                  <button
                    onClick={onPreviewClick}
                    className="hover:text-white transition-colors underline underline-offset-4"
                  >
                    Preview Site
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </footer>
    </div>
  )
}
