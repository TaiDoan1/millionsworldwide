"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import Logo3D from "./Logo3D";

/**
 * Welcome screen shown when the site opens (homepage only).
 *
 * Sequence (all motion reuses the site's signature easing):
 * 1. Shards + light streaks fly in from every direction and get sucked into
 *    the centre, accelerating as they converge.
 * 2. At ~1.25s a flash burst + expanding rings fire as the pieces merge.
 * 3. The logo pops in with a slight overshoot and glow.
 * 4. MILLIONS letters rise one by one, then the tagline fades in.
 * 5. At ~3s a SHOP THE DROP button appears: it fades the screen out and
 *    takes the visitor to the shop. Otherwise the screen fades out on its
 *    own (~4.8s) and unmounts (~5.5s).
 * 6. Extra effects: a light sweep glides across the logo after assembly;
 *    the MILLIONS letters decode from random glyphs into place while they
 *    rise; the exit is a zoom-out (scale down + fade) instead of a plain
 *    fade, like a camera pulling back.
 *
 * Plays once per browser session (sessionStorage flag), skipped entirely
 * for prefers-reduced-motion, and has a Skip button. While it is up the
 * page behind it cannot scroll.
 */
const SHOW_MS = 4800;
const FADE_MS = 700;
const CTA_MS = 3000;
const SCRAMBLE_START_MS = 1200;

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&";
const pickGlyph = () =>
  GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
const LETTERS = "MILLIONS".split("");

/** Deterministic pseudo-random so the shard layout never shifts mid-flight. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHARD_SHAPES = [
  "polygon(50% 0, 100% 100%, 0 100%)",
  "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
  "polygon(0 0, 100% 20%, 80% 100%, 10% 80%)",
  undefined, // square
];
const SHARD_COLORS = ["#ffffff", "#e5e5e5", "#a3a3a3", "#737373"];

type Shard = {
  tx: number;
  ty: number;
  r: number;
  size: number;
  shape?: string;
  color: string;
  delay: number;
  streak: boolean;
  streakLen: number;
};

function buildShards(): Shard[] {
  const rand = mulberry32(20261030);
  return Array.from({ length: 32 }, (_, i) => {
    const angle = rand() * Math.PI * 2;
    const dist = 280 + rand() * 380;
    const streak = i % 4 === 0;
    return {
      tx: Math.round(Math.cos(angle) * dist),
      ty: Math.round(Math.sin(angle) * dist * 0.85),
      // Streaks stay aligned with their flight path; shards tumble freely.
      r: streak
        ? Math.round((angle * 180) / Math.PI)
        : Math.round(rand() * 360 - 180),
      size: streak ? 2 : Math.round(5 + rand() * 17),
      shape: streak ? undefined : SHARD_SHAPES[i % SHARD_SHAPES.length],
      color: SHARD_COLORS[i % SHARD_COLORS.length],
      delay: Math.round(rand() * 200),
      streak,
      streakLen: streak ? Math.round(50 + rand() * 60) : 0,
    };
  });
}

export default function WelcomeIntro() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [ctaReady, setCtaReady] = useState(false);
  const [displayLetters, setDisplayLetters] = useState<string[]>(LETTERS);
  const shards = useMemo(() => buildShards(), []);
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
    const ctaTimer = window.setTimeout(() => setCtaReady(true), CTA_MS);
    const hideTimer = window.setTimeout(
      () => setVisible(false),
      SHOW_MS + FADE_MS
    );
    const fadeTimer = window.setTimeout(() => setLeaving(true), SHOW_MS);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(ctaTimer);
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

  // Scramble: once the logo has popped, each letter flickers through random
  // glyphs and locks into place left to right, while the rise animation
  // lifts it into view.
  useEffect(() => {
    if (!visible) return;
    let interval: number | undefined;
    const startTimer = window.setTimeout(() => {
      const start = Date.now();
      interval = window.setInterval(() => {
        const elapsed = Date.now() - start;
        setDisplayLetters(
          LETTERS.map((ch, i) =>
            elapsed >= 200 + i * 140 ? ch : pickGlyph()
          )
        );
        if (elapsed >= 200 + 7 * 140 && interval !== undefined) {
          window.clearInterval(interval);
        }
      }, 40);
    }, SCRAMBLE_START_MS);
    return () => {
      window.clearTimeout(startTimer);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [visible]);

  const skip = () => {
    setLeaving(true);
    window.setTimeout(() => setVisible(false), FADE_MS);
  };

  // CTA: fade the welcome out, then take the visitor to the shop. The
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
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black px-6 text-white transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        leaving ? "pointer-events-none scale-[0.93] opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo zone — shards, flash and rings are centred on the logo. */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
          {shards.map((s, i) => (
            <span
              key={i}
              className={
                s.streak
                  ? "mw-welcome-streak absolute left-1/2 top-1/2"
                  : "mw-welcome-shard absolute left-1/2 top-1/2"
              }
              style={
                {
                  "--tx": `${s.tx}px`,
                  "--ty": `${s.ty}px`,
                  "--r": `${s.r}deg`,
                  width: s.streak ? s.streakLen : s.size,
                  height: s.streak ? 2 : s.size,
                  background: s.streak
                    ? "linear-gradient(90deg, #ffffff, transparent)"
                    : s.color,
                  clipPath: s.shape,
                  animationDelay: `${s.delay}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
          <div
            className="mw-welcome-burst absolute left-1/2 top-1/2 h-40 w-40"
            style={{ animationDelay: "1250ms" }}
          />
          <div
            className="mw-welcome-ring absolute left-1/2 top-1/2 h-40 w-40 rounded-full border border-white/70"
            style={{ animationDelay: "1300ms" }}
          />
          <div
            className="mw-welcome-ring absolute left-1/2 top-1/2 h-40 w-40 rounded-full border border-white/40"
            style={{ animationDelay: "1480ms" }}
          />
        </div>
        <div
          className="mw-welcome-logo relative"
          style={{ animationDelay: "1200ms" }}
        >
          <Logo3D className="h-40 w-40 sm:h-52 sm:w-52" priority />
        </div>
        {/* Light sweep gliding across the logo after assembly */}
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
          <div
            className="mw-welcome-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            style={{ animationDelay: "2100ms" }}
          />
        </div>
      </div>

      <div className="mt-8 flex overflow-hidden" aria-hidden>
        {displayLetters.map((letter, i) => (
          <span
            key={i}
            className="mw-welcome-letter text-4xl font-extrabold uppercase tracking-[0.12em] sm:text-6xl"
            style={{ animationDelay: `${1250 + i * 60}ms` }}
          >
            {letter}
          </span>
        ))}
      </div>
      <span className="sr-only">Millions Worldwide</span>

      <p
        className="mw-welcome-tagline mt-5 text-[11px] uppercase tracking-[0.4em] text-white/70 sm:text-xs"
        style={{ animationDelay: "2900ms" }}
      >
        Form over noise
      </p>

      {ctaReady && !leaving && (
        <button
          type="button"
          onClick={shopDrop}
          className="mw-fade-up mt-8 rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-neutral-200"
        >
          Shop the drop
        </button>
      )}

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
