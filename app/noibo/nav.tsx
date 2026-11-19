"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Tab navigation for the /noibo sub-pages. One tab per section so each
 * page shows a single concern instead of everything stacked on one long
 * page. Founder-only tabs (Giờ làm, Cài đặt) are hidden from staff.
 */
export function NoiboNav({ isFounder }: { isFounder: boolean }) {
  const pathname = usePathname();
  const links = [
    { href: "/noibo", label: "Tổng quan" },
    { href: "/noibo/lich", label: "Lịch làm" },
    { href: "/noibo/viec", label: "Công việc" },
    { href: "/noibo/baocao", label: "Báo cáo" },
    ...(isFounder ? [{ href: "/noibo/giolam", label: "Giờ làm" }] : []),
    ...(isFounder ? [{ href: "/noibo/caidat", label: "Cài đặt" }] : []),
  ];
  return (
    <nav className="mb-8 flex gap-2 overflow-x-auto pb-1">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "shrink-0 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                : "shrink-0 rounded-full border border-black/20 px-4 py-2 text-sm hover:border-black/50"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
