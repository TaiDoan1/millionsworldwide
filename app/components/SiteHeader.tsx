import Link from "next/link";

const NAV = [
  { label: "shop", href: "/shop" },
  { label: "contact", href: "/contact" },
  { label: "return policy", href: "/return-policy" },
  { label: "lookbook", href: "/lookbook" },
  { label: "track order", href: "/track-order" },
];

export default function SiteHeader() {
  return (
    <header className="mx-auto w-full max-w-[1400px] px-6 pt-8 pb-4">
      <div className="grid grid-cols-3 items-center">
        {/* Search */}
        <div className="flex justify-start">
          <button aria-label="Search" className="transition-opacity hover:opacity-60">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="whitespace-nowrap text-2xl font-extrabold tracking-tight sm:text-3xl">
            millions worldwide
            <sup className="ml-0.5 text-xs align-super">™</sup>
          </Link>
        </div>

        {/* Cart */}
        <div className="flex justify-end">
          <button aria-label="Cart" className="transition-opacity hover:opacity-60">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2 3h3l2.2 12.2a1.5 1.5 0 001.5 1.3h8.4a1.5 1.5 0 001.5-1.2L21 7H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-base">
        {NAV.map((item) => (
          <Link key={item.label} href={item.href} className="transition-opacity hover:opacity-60">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
