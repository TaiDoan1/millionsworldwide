"use client";

import { useEffect, useState } from "react";
import Logo3D from "./Logo3D";

/**
 * Welcome screen shown when the site opens (homepage only).
 *
 * - Plays once per browser session (sessionStorage flag), so returning
 *   visitors and in-site navigation never see it twice in the same tab.
 * - Skipped entirely for prefers-reduced-motion.
 * - Auto-dismisses after ~4.5s and has a Skip button; while it is up the
 *   page behind it cannot scroll.
 * - Entrance motion reuses the site's signature easing
 *   (0.7s+ cubic-bezier(0.76, 0, 0.24, 1)) via the mw-welcome-* classes.
 */
const SHOW_MS = 3800;
const FADE_MS = 700;
const LETTERS = "MILLIONS".split("");

export default function WelcomeIntro() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

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

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Màn hình chào mừng Millions Worldwide"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black px-6 text-white transition-opacity duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="mw-welcome-logo">
        <Logo3D className="h-40 w-40 sm:h-52 sm:w-52" priority />
      </div>

      <div className="mt-8 flex overflow-hidden" aria-hidden>
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            className="mw-welcome-letter text-4xl font-extrabold uppercase tracking-[0.12em] sm:text-6xl"
            style={{ animationDelay: `${200 + i * 70}ms` }}
          >
            {letter}
          </span>
        ))}
      </div>
      <span className="sr-only">Millions Worldwide</span>

      <p
        className="mw-fade-up mt-5 text-[11px] uppercase tracking-[0.4em] text-white/70 sm:text-xs"
        style={{ animationDelay: "1100ms" }}
      >
        Form over noise
      </p>

      <button
        type="button"
        onClick={skip}
        className="absolute bottom-8 rounded-full border border-white/30 px-5 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
      >
        Bỏ qua
      </button>
    </div>
  );
}
