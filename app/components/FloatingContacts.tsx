"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const INSTAGRAM_URL = "https://www.instagram.com/millions.worldwide";
const FACEBOOK_URL = "https://www.facebook.com/share/14sNnRXMaZJ/?mibextid=wwXIfr";

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

/**
 * Floating contact buttons on the right edge — Instagram, Facebook,
 * WhatsApp (only when a wa.me link is set in /mw-office) and Back to
 * top. Rendered once in the root layout, so they show on every page
 * (homepage, shop, product detail, policy pages) after scrolling past
 * 600px — but never inside /mw-office (admin + POS are work screens).
 */
export default function FloatingContacts({
  whatsappUrl,
}: {
  whatsappUrl?: string;
}) {
  const pathname = usePathname();
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowFloating(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/mw-office")) return null;
  if (!showFloating) return null;

  const whatsapp = (whatsappUrl ?? "").trim();

  return (
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
  );
}
