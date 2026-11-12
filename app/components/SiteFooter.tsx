import Link from "next/link";
import Newsletter from "./Newsletter";

const POLICIES = [
  { label: "privacy policy", href: "/privacy-policy" },
  { label: "refund policy", href: "/refund-policy" },
  { label: "terms of service", href: "/terms-of-service" },
  { label: "shipping policy", href: "/shipping" },
  { label: "payment policy", href: "/payment" },
];

const SOCIALS: { name: string; href: string; path: React.ReactNode }[] = [
  { name: "Facebook", href: "https://www.facebook.com/share/14sNnRXMaZJ/?mibextid=wwXIfr", path: <path d="M14 8.5V7c0-.7.3-1 1.2-1H17V3h-2.5C12 3 11 4.4 11 6.5V8.5H9V12h2v9h3v-9h2.2l.5-3.5H14z" fill="currentColor" stroke="none" /> },
  { name: "Instagram", href: "https://www.instagram.com/millions.worldwide?xtok=MTZ5emN0bGV4aWkxZg%3D%3D&utm_source=qr", path: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" /></> },
];

export default function SiteFooter() {
  return (
    <footer className="mx-auto mt-32 w-full max-w-[1400px] px-6 pb-12">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
        {/* Left: policies + newsletter */}
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
              join our mailing list and stay up to date with new arrivals,
              promotions and events.
            </p>
            <Newsletter />
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
            <span className="text-sm">
              cash on delivery (COD) · bank transfer
            </span>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
        © 2026, millions worldwide
      </div>
    </footer>
  );
}
