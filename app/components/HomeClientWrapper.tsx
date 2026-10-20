"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Settings } from "../actions/settings"
import ComingSoon from "./ComingSoon"

interface HomeClientWrapperProps {
  settings: Settings
}

export default function HomeClientWrapper({ settings }: HomeClientWrapperProps) {
  const [isPreviewing, setIsPreviewing] = useState(false)

  // If Coming Soon mode is active and not currently previewing, show the luxury Coming Soon screen
  if (settings.comingSoonEnabled && !isPreviewing) {
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
    <main className="w-full min-h-screen relative">
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

      {/* Hero Section */}
      <section className="relative w-full h-screen bg-white flex flex-col justify-between overflow-hidden">
        {/* Fullscreen Image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/ig/banner.jpg"
            alt="Millions Worldwide Hero"
            fill
            className="object-cover object-top"
            priority
          />
          {/* Background Grid Effect on top of image */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none mix-blend-difference opacity-30">
            <div className="border-r border-b border-white"></div>
            <div className="border-r border-b border-white"></div>
            <div className="border-b border-white"></div>
            <div className="border-r border-b border-white"></div>
            <div className="border-r border-b border-white"></div>
            <div className="border-b border-white"></div>
            <div className="border-r border-white"></div>
            <div className="border-r border-white"></div>
            <div></div>
          </div>
        </div>

        {/* Overlay Text */}
        <div className="relative z-20 flex-1 flex flex-col justify-between p-8 pt-32 pointer-events-none">
          <div className="flex justify-between items-start text-[11px] font-semibold tracking-widest text-white drop-shadow-md">
            <div className="flex flex-col gap-10 max-w-sm pointer-events-auto">
              <p className="leading-loose">
                MILLIONS IS BUILT FOR THOSE WHO CHOOSE FORM OVER NOISE — AND LET THE WORK SPEAK WHERE WORDS DON&apos;T HAVE TO
              </p>
              <Link
                href="/trangchu"
                className="bg-[#1C1C1C] text-white px-8 py-4 w-fit hover:bg-black transition-colors flex items-center gap-2"
              >
                SHOP THE DROP <span className="text-lg leading-none">&rarr;</span>
              </Link>
            </div>
            <div className="text-right pointer-events-auto">
              <p className="leading-relaxed">
                FASHION WITHOUT<br />THE SHOUT
              </p>
            </div>
          </div>

          {/* Big Text */}
          <div className="mt-auto flex justify-center w-full relative z-30 pb-12 mix-blend-difference text-white">
            <h1 className="text-[12vw] leading-none font-bold tracking-tighter">
              MILLIONS
            </h1>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="px-8 py-32 bg-white text-black">
        <div className="mb-20">
          <span className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase mb-2 block">
            Selected Pieces
          </span>
          <h2 className="text-3xl font-medium tracking-tight">NEW ARRIVALS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
          {/* Item 1 */}
          <div className="col-span-1 pb-16">
            <div className="bg-[#F6F6F6] aspect-[4/5] relative mb-4 flex items-center justify-center p-8 group overflow-hidden">
              <Image
                src="/products/prod-1.jpg"
                alt="Cropped Zip Hoodie"
                fill
                className="object-cover mix-blend-darken group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold tracking-wider">
              <span>CROPPED ZIP HOODIE</span>
              <span>$88</span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="col-span-1 pb-40">
            <div className="bg-[#F6F6F6] aspect-square relative mb-4 flex items-center justify-center p-8 group overflow-hidden">
              <Image
                src="/products/prod-2.jpg"
                alt="Oversized Tee"
                fill
                className="object-cover mix-blend-darken group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold tracking-wider">
              <span>OVERSIZED TEE</span>
              <span>$45</span>
            </div>
          </div>

          {/* Item 3 (Large central piece) */}
          <div className="col-span-1">
            <div className="bg-[#F6F6F6] aspect-[2/3] relative mb-4 flex items-center justify-center p-4 group overflow-hidden">
              <Image
                src="/products/pants-1.jpg"
                alt="LATCH-FRONT WIDE JEANS"
                fill
                className="object-cover mix-blend-darken group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold tracking-wider">
              <span>LATCH-FRONT WIDE JEANS</span>
              <span>$92</span>
            </div>
          </div>

          {/* Item 4 */}
          <div className="col-span-1 pb-20">
            <div className="bg-[#F6F6F6] aspect-[4/5] relative mb-4 flex items-center justify-center p-8 group overflow-hidden">
              <Image
                src="/products/pants-2.jpg"
                alt="WIDE CARGO PANTS"
                fill
                className="object-cover mix-blend-darken group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold tracking-wider">
              <span>WIDE CARGO PANTS</span>
              <span>$78</span>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end mt-16">
          <Link
            href="/trangchu"
            className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:opacity-50 transition-opacity"
          >
            VIEW ALL <span>&rarr;</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
