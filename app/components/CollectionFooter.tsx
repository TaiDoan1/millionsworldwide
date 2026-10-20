"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Newsletter from "./Newsletter";

const NAVIGATE = [
  { label: "Shop", href: "/shop" },
  { label: "Giới thiệu", href: "/about" },
  { label: "Liên hệ", href: "/contact" },
  { label: "Theo dõi đơn hàng", href: "/track-order" },
  { label: "Điều khoản dịch vụ", href: "/terms-of-service" },
];

const OFFICIAL = [
  { label: "Chính sách đổi trả", href: "/refund-policy" },
  { label: "Chính sách vận chuyển", href: "/shipping" },
  { label: "Chính sách kiểm hàng", href: "/inspection" },
  { label: "Chính sách bảo mật", href: "/privacy-policy" },
  { label: "Chính sách thanh toán", href: "/payment" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/millions.worldwide" },
  { label: "Facebook", href: "https://www.facebook.com/share/14sNnRXMaZJ/?mibextid=wwXIfr" },
  { label: "TikTok", href: "https://tiktok.com/" },
  { label: "Youtube", href: "https://youtube.com/" },
];

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 8.2a2.8 2.8 0 00-2-2C18.2 5.8 12 5.8 12 5.8s-6.2 0-8 .4a2.8 2.8 0 00-2 2A29 29 0 001.6 12 29 29 0 002 15.8a2.8 2.8 0 002 2c1.8.4 8 .4 8 .4s6.2 0 8-.4a2.8 2.8 0 002-2 29 29 0 00.4-3.8 29 29 0 00-.4-3.8zM10 15V9l5.2 3z" />
    </svg>
  );
}

export default function CollectionFooter() {
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowFloating(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer className="mt-32 w-full px-10 pb-10 text-black">
        {/* Giant logo */}
        <div className="select-none font-extrabold uppercase leading-[0.9] tracking-tighter">
          <div className="text-[11.5vw]">Millions</div>
          <div className="text-[11.5vw]">
            Worldwide<sup className="align-super text-[3vw]">™</sup>
          </div>
        </div>

        {/* 5-column grid with dividers */}
        <div className="mt-16 grid grid-cols-1 gap-10 border-t border-neutral-300 pt-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
          <div className="lg:pr-8">
            <h3 className="text-lg font-bold uppercase">Newsletter</h3>
            <p className="mt-4 text-base text-neutral-600">Email Address</p>
            <Newsletter />
            <p className="mt-3 text-sm text-neutral-500">
              By signing up, you agree to our Privacy Policy*.
            </p>
          </div>

          <div className="lg:border-l lg:border-neutral-300 lg:px-8">
            <h3 className="text-lg font-bold uppercase">Navigate</h3>
            <ul className="mt-4 space-y-1 text-xl leading-[2]">
              {NAVIGATE.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-opacity hover:opacity-60">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-neutral-300 lg:px-8">
            <h3 className="text-lg font-bold uppercase">Official</h3>
            <ul className="mt-4 space-y-1 text-xl leading-[2]">
              {OFFICIAL.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-opacity hover:opacity-60">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-neutral-300 lg:px-8">
            <h3 className="text-lg font-bold uppercase">Social</h3>
            <ul className="mt-4 space-y-1 text-xl leading-[2]">
              {SOCIAL.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-60"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-neutral-300 lg:pl-8">
            <h3 className="text-lg font-bold uppercase">Store</h3>
            <p className="mt-4 text-xl leading-[2]">
              Millions Worldwide
              <br />
              Cửa hàng online
            </p>
            <Link
              href="/shop"
              className="mt-2 inline-block text-xl font-semibold underline underline-offset-4"
            >
              Mua sắm ngay
            </Link>
            <p className="mt-4 text-base text-neutral-600">
              SUPPORT
              <br />
              We&apos;re here Mon–Sun 10:00am – 9:30pm GMT+7.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-neutral-300 pt-6 text-center text-xl md:text-2xl">
          © Copyright Millions Worldwide 2026
        </div>
      </footer>

      {/* Floating buttons on the right edge */}
      {showFloating && (
        <div className="fixed bottom-24 right-5 z-[90] flex flex-col gap-3">
          <a
            href="https://www.instagram.com/millions.worldwide"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg"
          >
            <YoutubeIcon />
          </a>
          <button
            type="button"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold uppercase text-white shadow-lg"
          >
            Top
          </button>
        </div>
      )}
    </>
  );
}
