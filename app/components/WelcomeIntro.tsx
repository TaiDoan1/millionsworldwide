"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo3D from "./Logo3D";

/**
 * Welcome screen shown when the site opens (homepage only).
 *
 * Deliberately simple and elegant: a white screen with the slowly
 * rotating logo, the MILLIONS wordmark and the tagline. No intro
 * effects: everything is static except the logo's own rotation and
 * the fade out at the end. It fades out on its own after a few
 * seconds, or immediately via the Shop the drop button (goes to
 * the shop) or the Skip button (stays on the homepage).
 *
 * Plays once per browser session (sessionStorage flag), skipped
 * entirely for prefers-reduced-motion, and locks body scroll while
 * visible.
 */
const SHOW_MS = 3000;
const FADE_MS = 700;

export default function WelcomeIntro() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("mw-welcome-shown")) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      sessionStorage.setItem("mw-welcome-shown", "1");
    } catch {
      return;
    }
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const hideTimer = window.setTimeout(
      () => setVisible(false),
      SHOW_MS + FADE_MS
    );
    const fadeTimer = window.setTimeout(() => setLeaving(true), SHOW_MS);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(fadeTimer);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  const skip = () => {
    setLeaving(true);
    window.setTimeout(() => setVisible(false), FADE_MS);
  };

  // Fade the welcome out, then take the visitor to the shop. The
  // short delay lets the fade start before the page transition runs.
  const shopDrop = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => router.push("/trangchu"), 350);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Màn hình chào mừng Millions Worldwide"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white px-6 text-black transition-opacity duration-700 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <Logo3D className="h-40 w-40 sm:h-52 sm:w-52" />

      <div className="mt-8 text-4xl font-extrabold uppercase tracking-[0.12em] sm:text-6xl">
        MILLIONS
      </div>

      <p className="mt-5 text-[11px] uppercase tracking-[0.4em] text-neutral-500 sm:text-xs">
        Form over noise
      </p>

      <button
        type="button"
        onClick={shopDrop}
        className="mt-10 rounded-full bg-black px-7 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
      >
        Shop the drop
      </button>

      <button
        type="button"
        onClick={skip}
        className="absolute bottom-8 rounded-full border border-neutral-300 px-5 py-2 text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:bg-black hover:text-white"
      >
        Bỏ qua
      </button>
    </div>
  );
}
