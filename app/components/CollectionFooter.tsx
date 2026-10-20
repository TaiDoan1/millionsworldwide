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

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold uppercase tracking-wide text-black">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

const linkCls =
  "text-base leading-[1.9] text-[#67645e] transition-colors hover:text-black";

/**
 * Reference footer: a white rounded panel (12px, soft shadow) inset by the page
 * margins — giant logo, divider, newsletter row, divider, 4-column info grid
 * (1fr 1fr 0.7fr 1.3fr), then a centred copyright row with a top border.
 */
export default function CollectionFooter() {
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowFloating(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer className="mx-3 mb-[1.25rem] mt-10 sm:mx-[44px] sm:mb-[2.25vw] sm:mt-[2.25vw]">
        <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          {/* Giant logo */}
          <div className="border-b border-[#84827e] px-4 pb-7 pt-7">
            <div className="select-none font-black uppercase leading-[0.9] tracking-tighter text-black">
              <div className="text-[8vw]">Millions</div>
              <div className="text-[8vw]">
                Worldwide<sup className="align-super text-[2.2vw]">™</sup>
              </div>
            </div>
          </div>

          {/* Newsletter row */}
          <div className="border-b border-[#84827e] px-4 py-7">
            <h3 className="text-lg font-bold uppercase tracking-wide text-black">
              Newsletter
            </h3>
            <Newsletter />
          </div>

          {/* Info grid — 1fr 1fr 0.7fr 1.3fr like the reference */}
          <div className="grid grid-cols-2 gap-8 px-4 py-7 lg:grid-cols-[1fr_1fr_0.7fr_1.3fr]">
            <FooterColumn title="Navigate">
              <ul>
                {NAVIGATE.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            <FooterColumn title="Official">
              <ul>
                {OFFICIAL.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            <FooterColumn title="Social">
              <ul>
                {SOCIAL.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            <FooterColumn title="Store">
              <p className={linkCls}>
                Millions Worldwide
                <br />
                Cửa hàng online
              </p>
              <p className={`${linkCls} mt-3`}>
                SUPPORT
                <br />
                We&apos;re here Mon–Sun 10:00am – 9:30pm GMT+7.
              </p>
              <Link
                href="/shop"
                className="mt-2 inline-block text-base font-semibold text-black underline underline-offset-4"
              >
                Mua sắm ngay
              </Link>
            </FooterColumn>
          </div>

          {/* Copyright */}
          <div className="mx-4 border-t border-[#84827e] py-6 text-center text-lg text-black sm:text-xl">
            © Copyright Millions Worldwide 2026
          </div>
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
