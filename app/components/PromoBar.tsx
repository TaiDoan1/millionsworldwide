"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Promo strip at the very top of the page (30px tall, black). The text,
 * link and on/off switch live in /mw-office (Settings). It never renders
 * on the admin pages themselves, and the floating headers shift down by
 * 30px when it shows (see Header / CollectionHeader promo props).
 */
export default function PromoBar({
  enabled,
  text,
  link,
}: {
  enabled: boolean;
  text: string;
  link: string;
}) {
  const pathname = usePathname();
  if (!enabled || text.trim().length === 0) return null;
  if (pathname?.startsWith("/mw-office")) return null;

  const label = (
    <span className="block truncate px-4 text-center text-[11px] font-semibold uppercase tracking-widest">
      {text}
    </span>
  );

  return (
    <div className="flex h-[30px] items-center justify-center bg-black text-white">
      {link ? (
        <Link
          href={link}
          className="block w-full transition-opacity hover:opacity-80"
        >
          {label}
        </Link>
      ) : (
        label
      )}
    </div>
  );
}
