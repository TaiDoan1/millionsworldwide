"use client";

import { useEffect, useState } from "react";
import Logo3D from "./Logo3D";

/**
 * Welcome screen shown when the site opens (homepage only).
 *
 * Just the logo, dead centre on a white screen: it rolls in from
 * the left and stops in the middle, keeps its slow rotation, then
 * the screen fades out on its own after a few seconds.
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

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Màn hình chào mừng Millions Worldwide"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-white px-6 text-black transition-opacity duration-700 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="mw-welcome-roll-in">
        <Logo3D className="h-40 w-40 sm:h-52 sm:w-52" />
      </div>
    </div>
  );
}
