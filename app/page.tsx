import Image from "next/image";
import Link from "next/link";
import Clock from "./components/Clock";
import SocialIcons from "./components/SocialIcons";

type NavItem = { label: string; href: string };

const NAV: NavItem[] = [
  { label: "SHOP", href: "/shop" },
  { label: "CONTACT", href: "/contact" },
  { label: "LOOKBOOK", href: "/lookbook" },
  { label: "PRE – ORDER STATUS", href: "/pre-order-status" },
  { label: "TRACK ORDER", href: "/track-order" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 text-center">
      {/* Logo — thay bằng logo thật ở /public/logo.svg (hoặc .png) */}
      <div className="relative h-28 w-28">
        <Image
          src="/logo.svg"
          alt="MILLIONS WORLDWIDE"
          fill
          priority
          className="object-contain"
        />
      </div>

      {/* Đồng hồ real-time */}
      <div className="mt-8">
        <Clock />
      </div>

      {/* Menu chính */}
      <nav className="mt-16 flex w-full max-w-xs flex-col gap-3">
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="border-2 border-black px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-black hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Social */}
      <div className="mt-16">
        <SocialIcons />
      </div>
    </main>
  );
}
