"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo3D from "./Logo3D";

export default function Header() {
  const pathname = usePathname();

  // The shop/collection pages use their own floating CollectionHeader instead.
  if (pathname?.startsWith("/shop")) {
    return null;
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 text-white drop-shadow-md">
      {/* Left - Logo */}
      <div className="flex-1">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity w-fit">
          <Logo3D className="w-8 h-8" priority />
          <span className="text-sm font-semibold tracking-widest uppercase">
            Millions
          </span>
        </Link>
      </div>

      {/* Center - Nav */}
      <nav className="hidden md:flex gap-10 text-[10px] font-medium tracking-widest uppercase">
        <Link href="/shop" className="hover:text-gray-500 transition-colors">Shop</Link>
        <Link href="/about" className="hover:text-gray-500 transition-colors">About</Link>
        <Link href="/contact" className="hover:text-gray-500 transition-colors">Contact</Link>
      </nav>

      {/* Right - Utils */}
      <div className="flex-1 flex justify-end gap-8 text-[10px] font-medium tracking-widest uppercase">
        <button className="hover:text-gray-500 transition-colors flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          Search
        </button>
        <button className="hover:text-gray-500 transition-colors flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          Bag
        </button>
      </div>
    </header>
  );
}
