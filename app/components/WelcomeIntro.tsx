"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Logo3D from "./Logo3D";

/**
 * Welcome screen shown when the site opens (homepage only).
 *
 * Just the logo, dead centre on a white screen: it rolls in from
 * the left and stops in the middle, keeps its slow rotation, then
 * instead of disappearing it travels up and shrinks into the header
 * logo at the top-left, so the two logos merge into one. The white
 * background fades as it travels, revealing the homepage beneath.
 *
 * The landing spot is measured live from the header logo
 * ([data-mw-header-logo]) so it lines up exactly on any screen
 * size. If that logo cannot be measured, it falls back to a plain
 * fade-out.
 *
 * Plays once per browser session (sessionStorage flag), skipped
 * entirely for prefers-reduced-motion, and locks body scroll while
 * visible.
 */
const SHOW_MS = 3000;
const EXIT_MS = 900;
const FADE_MS = 700;

type Merge = { dx: number; dy: number; scale: number };

export default function WelcomeIntro() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [fadeOnly, setFadeOnly] = useState(false);
  const [merge, setMerge] = useState<Merge | null>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Measure where the header logo sits, then fly the welcome logo
  // there. The transform is applied a tick after the exit transition
  // is in place so the flight itself animates.
  const beginExit = useCallback(() => {
    const target = document.querySelector("[data-mw-header-logo]");
    const logoEl = logoRef.current;
    let next: Merge | null = null;
    if (target && logoEl) {
      const t = target.getBoundingClientRect();
      const l = logoEl.getBoundingClientRect();
      if (t.width > 0 && l.width > 0) {
        next = {
          dx: t.left + t.width / 2 - (l.left + l.width / 2),
          dy: t.top + t.height / 2 - (l.top + l.height / 2),
          scale: t.width / l.width,
        };
      }
    }
    setExiting(true);
    if (next) {
      const m = next;
      window.setTimeout(() => setMerge(m), 50);
      window.setTimeout(() => setVisible(false), EXIT_MS + 100);
    } else {
      setFadeOnly(true);
      window.setTimeout(() => setVisible(false), FADE_MS);
    }
  }, []);

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
    const exitTimer = window.setTimeout(beginExit, SHOW_MS);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(exitTimer);
    };
  }, [beginExit]);

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
      className={`fixed inset-0 z-[200] flex items-center justify-center overflow-hidden transition-opacity duration-700 ${
        exiting ? "pointer-events-none" : ""
      } ${exiting && fadeOnly ? "opacity-0" : "opacity-100"}`}
    >
      <div
        aria-hidden
        className={`absolute inset-0 bg-white transition-opacity duration-700 ${
          exiting ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        ref={logoRef}
        className={`mw-welcome-roll-in ${exiting ? "mw-welcome-exit" : ""}`}
        style={
          merge
            ? {
                transform: `translate(${merge.dx}px, ${merge.dy}px) scale(${merge.scale})`,
              }
            : undefined
        }
      >
        <Logo3D className="h-40 w-40 sm:h-52 sm:w-52" />
      </div>
    </div>
  );
}
