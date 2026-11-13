"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Newsletter from "./Newsletter";

const NAVIGATE = [
  { label: "Shop", href: "/trangchu" },
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
];

const FACEBOOK_URL = "https://www.facebook.com/share/14sNnRXMaZJ/?mibextid=wwXIfr";
const INSTAGRAM_URL = "https://www.instagram.com/millions.worldwide";

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M14 8.5V7c0-.7.3-1 1.2-1H17V3h-2.5C12 3 11 4.4 11 6.5V8.5H9V12h2v9h3v-9h2.2l.5-3.5H14z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.5A10 10 0 1012 2zm0 2a8 8 0 016.8 12.2l-.3.5.7 2.6-2.7-.7-.5.3A8 8 0 1112 4zm-3.3 4.1c-.2 0-.5 0-.7.4-.3.4-1 1-1 2.3s1 2.7 1.2 2.9c.2.2 2 3.1 5 4.2 2.4.9 2.9.8 3.5.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4-.3-.2-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.5-.4-.5-.6-.5h-.2z"
        fill="currentColor"
        stroke="none"
      />
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
 *
 * whatsappUrl comes from settings (edited in /mw-office → Cài đặt → Liên
 * hệ). Empty means no WhatsApp button — the shop shows it only once the
 * owner has pasted their wa.me link.
 */
export default function CollectionFooter({
  whatsappUrl,
}: {
  whatsappUrl?: string;
}) {
  const [showFloating, setShowFloating] = useState(false);
  const whatsapp = (whatsappUrl ?? "").trim();
  const social = whatsapp
    ? [...SOCIAL, { label: "WhatsApp", href: whatsapp }]
    : SOCIAL;

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
                {social.map((l) => (
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
                href="/trangchu"
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
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg"
          >
            <InstagramIcon />
          </a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg"
          >
            <FacebookIcon />
          </a>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"
            >
              <WhatsAppIcon />
            </a>
          )}
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
