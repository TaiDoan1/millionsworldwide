import Link from "next/link";

/**
 * Homepage hero — brand film, sized with the Whenever homepage hero
 * formula: calc(100vh - 2rem); from 760px up calc(100vh - 5rem), capped at
 * calc(100vh - 4.5vw); 12px radius. Videos follow the ComingSoon pattern
 * (separate desktop / mobile elements).
 */
export default function HeroSection() {
  return (
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
  );
}
