"use client";

import Link from "next/link";
import Newsletter from "./Newsletter";
import { useLanguage } from "../lib/i18n";

const NAVIGATE = [
  { key: "footer.shop", href: "/trangchu" },
  { key: "footer.about", href: "/about" },
  { key: "footer.contact", href: "/contact" },
  { key: "footer.track", href: "/track-order" },
  { key: "nav.terms", href: "/terms-of-service" },
];

const OFFICIAL = [
  { key: "footer.refund", href: "/refund-policy" },
  { key: "footer.shipping", href: "/shipping" },
  { key: "footer.inspection", href: "/inspection" },
  { key: "footer.privacy", href: "/privacy-policy" },
  { key: "footer.payment", href: "/payment" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/millions.worldwide" },
  { label: "Facebook", href: "https://www.facebook.com/share/14sNnRXMaZJ/?mibextid=wwXIfr" },
];

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
  const { t } = useLanguage();
  const whatsapp = (whatsappUrl ?? "").trim();
  const social = whatsapp
    ? [...SOCIAL, { label: "WhatsApp", href: whatsapp }]
    : SOCIAL;

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
                  <li key={l.key}>
                    <Link href={l.href} className={linkCls}>
                      {t(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            <FooterColumn title="Official">
              <ul>
                {OFFICIAL.map((l) => (
                  <li key={l.key}>
                    <Link href={l.href} className={linkCls}>
                      {t(l.key)}
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
                {t("footer.store")}
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
                {t("footer.shopNow")}
              </Link>
            </FooterColumn>
          </div>

          {/* Copyright */}
          <div className="mx-4 border-t border-[#84827e] py-6 text-center text-lg text-black sm:text-xl">
            © Copyright Millions Worldwide 2026
          </div>
        </div>
      </footer>
    </>
  );
}
