"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PRODUCTS } from "../data/products";
import Logo3D from "./Logo3D";

const NAV_LINKS = [
  { label: "SHOP", href: "/shop" },
  { label: "ABOUT", href: "/about" },
  { label: "MILLIONS CARE", href: "/millions-care" },
  { label: "FAQ", href: "/faq" },
];

const TABS = [
  { key: "all", label: "ALL PRODUCTS" },
  { key: "t-shirts", label: "T-SHIRTS" },
  { key: "sneakers", label: "SNEAKERS" },
  { key: "sweatpants", label: "SWEATPANTS" },
  { key: "best", label: "BEST SELLER" },
] as const;

function productsForTab(key: string) {
  if (key === "t-shirts") return PRODUCTS.filter((p) => p.category === "t-shirts");
  if (key === "sneakers") return PRODUCTS.filter((p) => p.category === "sneakers");
  if (key === "sweatpants") return PRODUCTS.filter((p) => p.category === "sweatpants");
  if (key === "best") return PRODUCTS.filter((p) => p.compareAt || p.preOrder);
  return PRODUCTS;
}

export default function CollectionHeader() {
  const [visible, setVisible] = useState(true);
  const [shopOpen, setShopOpen] = useState(false);
  const [tab, setTab] = useState<string>("all");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(!(y > last && y > 150));
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabProducts = productsForTab(tab).slice(0, 4);

  return (
    <div
      className={`fixed left-10 right-10 top-3 z-[100] transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] sm:left-[44px] sm:right-[44px] sm:top-[22px] ${
        visible ? "translate-y-0" : "-translate-y-[150%]"
      }`}
      onMouseLeave={() => setShopOpen(false)}
    >
      <header className="flex h-[92px] items-center justify-between rounded-2xl bg-white px-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:h-[73px] sm:rounded-[12px]">
        {/* Left nav */}
        <nav className="hidden flex-1 items-center gap-12 lg:flex">
          {NAV_LINKS.map((item) =>
            item.label === "SHOP" ? (
              <button
                key={item.label}
                type="button"
                onMouseEnter={() => {
                  setTab("all");
                  setShopOpen(true);
                }}
                className="text-[max(1rem,1.125vw)] font-bold uppercase tracking-normal text-black transition-opacity hover:opacity-60"
              >
                SHOP
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="text-[max(1rem,1.125vw)] font-bold uppercase tracking-normal text-black transition-opacity hover:opacity-60"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex flex-1 lg:hidden">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="text-xl font-bold uppercase text-black"
          >
            {mobileOpen ? "CLOSE" : "MENU"}
          </button>
        </div>

        {/* Center logo — rotating 3D logo from the Coming Soon screen */}
        <Link
          href="/"
          aria-label="Millions Worldwide"
          className="flex items-center justify-center whitespace-nowrap"
        >
          <span className="pointer-events-none block">
            <Logo3D className="h-[70px] w-[70px] sm:h-16 sm:w-16" priority />
          </span>
        </Link>

        {/* Right utils */}
        <div className="flex flex-1 items-center justify-end gap-12">
          <button
            type="button"
            className="hidden text-[max(1rem,1.125vw)] font-bold uppercase text-black transition-opacity hover:opacity-60 md:block"
          >
            Search
          </button>
          <button
            type="button"
            className="hidden text-[max(1rem,1.125vw)] font-bold uppercase text-black transition-opacity hover:opacity-60 md:block"
          >
            Account
          </button>
          <button
            type="button"
            className="text-[max(1rem,1.125vw)] font-bold uppercase text-black transition-opacity hover:opacity-60"
          >
            Cart (0)
          </button>
          <button
            type="button"
            className="hidden items-center gap-2 rounded-full border border-black px-4 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white md:flex"
          >
            Tiếng Việt
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              VN
            </span>
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav className="mt-2 flex flex-col gap-1 rounded-2xl bg-white p-6 shadow-xl lg:hidden">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="py-2 text-xl font-bold uppercase text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Mega menu — expands/collapses with the reference's 0.7s signature easing */}
      <div
        className={`mt-2 hidden overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)] transition-[max-height,opacity,visibility] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] lg:block ${
          shopOpen ? "visible max-h-[620px] opacity-100" : "invisible max-h-0 opacity-0"
        }`}
      >
        <div className="px-10 py-8">
          <div className="flex items-center justify-center gap-9">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onMouseEnter={() => setTab(t.key)}
                className={`text-[max(0.8rem,1.125vw)] font-bold uppercase tracking-[0.02em] transition-colors duration-300 ${
                  tab === t.key
                    ? "text-[#6d6e70] underline underline-offset-8"
                    : "text-[#acaaa5]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-4 gap-8">
            {tabProducts.map((p) => (
              <Link key={p.id} href="/shop" className="group">
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-base font-bold uppercase text-black">{p.name}</p>
                <span className="mt-1 inline-block text-sm font-semibold uppercase tracking-wider text-black underline underline-offset-4">
                  Buy now
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
