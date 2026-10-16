import Link from "next/link";
import Newsletter from "./Newsletter";

const POLICIES = [
  { label: "privacy policy", href: "/privacy-policy" },
  { label: "refund policy", href: "/refund-policy" },
  { label: "terms of service", href: "/terms-of-service" },
];

const SOCIALS: { name: string; href: string; path: React.ReactNode }[] = [
  { name: "Facebook", href: "https://www.facebook.com/share/14sNnRXMaZJ/?mibextid=wwXIfr", path: <path d="M14 8.5V7c0-.7.3-1 1.2-1H17V3h-2.5C12 3 11 4.4 11 6.5V8.5H9V12h2v9h3v-9h2.2l.5-3.5H14z" fill="currentColor" stroke="none" /> },
  { name: "Instagram", href: "https://www.instagram.com/millions.worldwide?xtok=MTZ5emN0bGV4aWkxZg%3D%3D&utm_source=qr", path: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" /></> },
  { name: "TikTok", href: "https://tiktok.com/", path: <path d="M14 3c.3 2.1 1.6 3.6 3.8 3.9v2.6c-1.4.1-2.7-.3-3.8-1v5.6a5 5 0 11-5-5c.3 0 .6 0 .9.1v2.7a2.4 2.4 0 101.7 2.3V3H14z" fill="currentColor" stroke="none" /> },
  { name: "Twitter", href: "https://twitter.com/", path: <path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4 4 0 00-6.9 3.7A11.4 11.4 0 013.6 4.6a4 4 0 001.3 5.4c-.7 0-1.3-.2-1.8-.5a4 4 0 003.2 4c-.6.1-1.2.2-1.8.1a4 4 0 003.8 2.8A8.1 8.1 0 012 18.1a11.4 11.4 0 006.2 1.8c7.4 0 11.5-6.2 11.5-11.5v-.5c.8-.6 1.5-1.3 2.1-2z" fill="currentColor" stroke="none" /> },
  { name: "WhatsApp", href: "https://whatsapp.com/", path: <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.5A10 10 0 1012 2zm0 2a8 8 0 016.8 12.2l-.3.5.7 2.6-2.7-.7-.5.3A8 8 0 1112 4zm-3.3 4.1c-.2 0-.5 0-.7.4-.3.4-1 1-1 2.3s1 2.7 1.2 2.9c.2.2 2 3.1 5 4.2 2.4.9 2.9.8 3.5.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4-.3-.2-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.5-.4-.5-.6-.5h-.2z" fill="currentColor" stroke="none" /> },
  { name: "Discord", href: "https://discord.com/", path: <path d="M19 5.5A16 16 0 0015 4.3l-.2.4a12 12 0 00-5.6 0L9 4.3A16 16 0 005 5.5C2.5 9.2 1.8 12.8 2.1 16.4a16 16 0 004.9 2.5l.6-1c-.6-.2-1.1-.5-1.6-.8l.4-.3a11 11 0 009.2 0l.4.3c-.5.3-1 .6-1.6.8l.6 1a16 16 0 004.9-2.5c.4-4.2-.6-7.8-2.9-10.9zM9 14c-.7 0-1.3-.7-1.3-1.5S8.3 11 9 11s1.3.7 1.3 1.5S9.7 14 9 14zm6 0c-.7 0-1.3-.7-1.3-1.5S14.3 11 15 11s1.3.7 1.3 1.5S15.7 14 15 14z" fill="currentColor" stroke="none" /> },
];

const PAYMENTS = ["amex", "pay", "mc", "visa"];

export default function SiteFooter() {
  return (
    <footer className="mx-auto mt-32 w-full max-w-[1400px] px-6 pb-12">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
        {/* Left: policies + newsletter + country */}
        <div>
          <h3 className="text-xl font-bold">policies</h3>
          <ul className="mt-5 space-y-3">
            {POLICIES.map((p) => (
              <li key={p.label}>
                <Link href={p.href} className="transition-opacity hover:opacity-60">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-14">
            <h3 className="text-xl font-bold">join the millions worldwide™ community</h3>
            <p className="mt-4 max-w-md text-neutral-600">
              join our mailing list and enjoy up to 10% off your first order. stay up to
              date with new arrivals, promotions and events.
            </p>
            <Newsletter />
          </div>

          <div className="mt-14">
            <h3 className="text-base">country/region</h3>
            <div className="relative mt-3 inline-block">
              <select
                aria-label="Country/region"
                defaultValue="US"
                className="appearance-none border border-black bg-white px-5 py-3 pr-10 text-base outline-none"
              >
                <option value="US">united states (usd $)</option>
                <option value="VN">vietnam (usd $)</option>
                <option value="GB">united kingdom (usd $)</option>
                <option value="JP">japan (usd $)</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: logo + socials */}
        <div className="flex flex-col md:items-end md:text-right">
          <div className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            millions
            <br />
            worldwide<sup className="align-super text-2xl">™</sup>
          </div>

          <div className="mt-12">
            <h3 className="text-base md:text-right">follow us</h3>
            <div className="mt-4 flex gap-5 md:justify-end">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="transition-opacity hover:opacity-60">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {s.path}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 md:text-right">
            <div className="flex items-center gap-2 md:justify-end">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span className="text-sm">secure &amp; protected payments</span>
            </div>
            <div className="mt-3 flex gap-2 md:justify-end">
              {PAYMENTS.map((p) => (
                <span key={p} className="flex h-7 w-11 items-center justify-center rounded border border-neutral-300 text-[10px] font-bold uppercase text-neutral-500">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
        © 2026, millions worldwide
      </div>
    </footer>
  );
}
