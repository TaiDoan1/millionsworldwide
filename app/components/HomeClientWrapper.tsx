"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Settings } from "../actions/settings"
import ComingSoon from "./ComingSoon"
import WelcomeIntro from "./WelcomeIntro"
import InstagramSection from "./InstagramSection"
import SiteFooter from "./SiteFooter"
import { PRODUCTS } from "../data/products"

interface HomeClientWrapperProps {
  settings: Settings
}

const MARQUEE_PHRASES = [
  "Millions Worldwide™",
  "Form over noise",
  "The online launch — 01.11.2026",
  "Miễn phí vận chuyển toàn quốc",
  "Designed in Vietnam",
  "New drop — 17 pieces",
]

const COLLECTION_TILES = [
  { label: "The Sets", img: "/products/set-hoodie-black-1.jpg", alt: "Millions black hoodie set" },
  { label: "Signature Denim", img: "/products/set-jeans-signature-1.jpg", alt: "Millions signature denim set" },
  { label: "Tees & Tanks", img: "/products/tee-millions-1.jpg", alt: "Millions worldwide tee" },
]

const FEATURED_IDS = ["set-hoodie-black", "tee-millions", "jeans-wide", "set-jeans-signature"]
const FEATURED_ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[2/3]", "aspect-[4/5]"]
const FEATURED_OFFSETS = ["md:pb-16", "md:pb-40", "", "md:pb-20"]

const featured = FEATURED_IDS.flatMap((id) => {
  const p = PRODUCTS.find((x) => x.id === id)
  return p ? [p] : []
})

function fmtPrice(thousands: number) {
  return `${(thousands * 1000).toLocaleString("en-US")}₫`
}

export default function HomeClientWrapper({ settings }: HomeClientWrapperProps) {
  const [isPreviewing, setIsPreviewing] = useState(false)
  // Auto-open the site once the configured launch moment ("Thời gian mở web"
  // in /admin) has passed. Mount-guarded so the server render and the first
  // client render stay identical (no hydration mismatch).
  const [launched, setLaunched] = useState(false)
  useEffect(() => {
    if (!settings.launchDate) return
    const target = new Date(settings.launchDate).getTime()
    if (!Number.isNaN(target) && Date.now() >= target) setLaunched(true)
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

      {/* Hero — brand film, sized with the Whenever homepage hero formula:
          calc(100vh - 2rem); from 760px up calc(100vh - 5rem), capped at
          calc(100vh - 4.5vw); 12px radius. Videos follow the ComingSoon pattern
          (separate desktop / mobile elements). */}
      <section className="px-3 pt-3 md:px-6 md:pt-5">
        <div className="relative h-[calc(100vh-2rem)] min-[760px]:h-[calc(100vh-5rem)] min-[760px]:max-h-[calc(100vh-4.5vw)] w-full overflow-hidden rounded-[12px] bg-black">
          <video
            src="/videos/desktop.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/ig/banner.jpg"
            aria-label="Millions Worldwide — Tokyo denim film"
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
          />
          <video
            src="/videos/mobile.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/ig/banner.jpg"
            aria-label="Millions Worldwide — Tokyo denim film"
            className="absolute inset-0 block h-full w-full object-cover md:hidden"
          />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

          {/* Top corners (below the floating global header) */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between px-6 pt-24 text-white md:px-10 md:pt-28">
            <p
              className="mw-fade-up max-w-[230px] text-[11px] font-semibold uppercase leading-relaxed tracking-widest drop-shadow-md"
              style={{ animationDelay: "0.3s" }}
            >
              Form over noise — designed in Vietnam
            </p>
            <p
              className="mw-fade-up text-right text-[11px] font-semibold uppercase leading-relaxed tracking-widest drop-shadow-md"
              style={{ animationDelay: "0.45s" }}
            >
              The online launch
              <br />
              01.11.2026
            </p>
          </div>

          {/* Bottom: wordmark + CTA */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h1
                aria-label="MILLIONS"
                className="mw-outline-text text-[15vw] font-black leading-[0.85] tracking-tighter [filter:drop-shadow(0_2px_14px_rgba(0,0,0,0.3))] md:text-[11vw]"
              >
                {"MILLIONS".split("").map((ch, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="-mt-[0.1em] inline-block overflow-hidden pt-[0.1em] align-bottom"
                  >
                    <span
                      className="mw-letter inline-block"
                      style={{ animationDelay: `${0.15 + i * 0.07}s` }}
                    >
                      {ch}
                    </span>
                  </span>
                ))}
              </h1>
              <Link
                href="/trangchu"
                className="mw-fade-up bg-white px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-black transition-colors duration-500 hover:bg-black hover:text-white"
                style={{ animationDelay: "1s" }}
              >
                Shop the drop <span aria-hidden>→</span>
              </Link>
            </div>
            <p
              className="mw-fade-up mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-white drop-shadow-md"
              style={{ animationDelay: "1.15s" }}
            >
              Millions Worldwide™ — Fashion without the shout
            </p>
          </div>
        </div>
      </section>

      {/* Marquee ticker */}
      <section aria-hidden className="mt-4 overflow-hidden bg-black py-3 text-white md:mt-6">
        <div className="mw-marquee flex w-max items-center whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.25em]">
          {[0, 1].map((half) => (
            <div key={half} className="flex items-center">
              {MARQUEE_PHRASES.map((phrase) => (
                <span key={`${half}-${phrase}`} className="flex items-center">
                  <span className="px-8">{phrase}</span>
                  <span className="text-[10px]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto mt-24 w-full max-w-[1400px] px-6 md:mt-32">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Collections
            </span>
            <h2 className="text-3xl font-medium tracking-tight md:text-4xl">SHOP BY STORY</h2>
          </div>
          <Link
            href="/trangchu"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-50"
          >
            View all <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          {COLLECTION_TILES.map((tile) => (
            <Link
              key={tile.label}
              href="/trangchu"
              className="group relative block aspect-[2/3] overflow-hidden rounded-[12px] bg-[#F6F6F6]"
            >
              <Image
                src={tile.img}
                alt={tile.alt}
                fill
                sizes="(max-width: 640px) 92vw, 31vw"
                className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.76,0,0.24,1)] group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-white">
                <span className="text-lg font-bold uppercase tracking-wide md:text-xl">{tile.label}</span>
                <span className="text-xl transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial / brand statement */}
      <section className="mx-auto mt-24 w-full max-w-[1400px] px-6 md:mt-36">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              The Millions story
            </span>
            <h2 className="text-4xl font-bold leading-[1.02] tracking-tight md:text-6xl">
              FASHION
              <br />
              WITHOUT
              <br />
              THE SHOUT
            </h2>
            <p className="mt-8 max-w-md text-[15px] leading-relaxed text-neutral-600">
              Millions is built for those who choose form over noise — and let the work speak where
              words don&apos;t have to. Mỗi thiết kế bắt đầu từ phom dáng, chất liệu và chi tiết dập
              nổi đặc trưng, được làm tại Việt Nam cho người mặc ở khắp nơi.
            </p>
            <Link
              href="/about"
              className="mt-10 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-opacity hover:opacity-50"
            >
              Về Millions <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] bg-[#F6F6F6]">
            <Image
              src="/products/jacket-black-1.jpg"
              alt="Millions black stitch jacket"
              fill
              sizes="(max-width: 768px) 92vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* New Arrivals — featured pieces, data-driven from the catalog */}
      <section className="mx-auto mt-24 w-full max-w-[1400px] px-6 md:mt-36">
        <div className="mb-14 md:mb-20">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Selected Pieces
          </span>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">NEW ARRIVALS</h2>
        </div>

        <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-4 md:gap-8">
          {featured.map((p, i) => (
            <Link key={p.id} href="/trangchu" className={`group col-span-1 ${FEATURED_OFFSETS[i] ?? ""}`}>
              <div
                className={`relative mb-4 overflow-hidden rounded-[12px] bg-[#F6F6F6] ${FEATURED_ASPECTS[i] ?? "aspect-[2/3]"}`}
              >
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 45vw, 22vw"
                  className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.76,0,0.24,1)] group-hover:scale-105"
                />
              </div>
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider">
                <span>{p.name}</span>
                <span className="whitespace-nowrap">{fmtPrice(p.price)}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 flex w-full justify-end md:mt-16">
          <Link
            href="/trangchu"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-50"
          >
            View all <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <InstagramSection />
      <SiteFooter />
    </main>
  )
}
