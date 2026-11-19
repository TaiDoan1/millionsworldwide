import Link from "next/link";
import type { NoiboStaff } from "../../backend/storage/types";
import { LogoutButton } from "./dashboard-client";

/**
 * Shared shell for the internal staff pages (/noibo). Plain server
 * components — no shop header, cart or floating buttons here (the root
 * layout skips the shop chrome for /noibo; see app/layout.tsx).
 */

export function NoiboShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 sm:pt-14">
      <header className="mb-8 border-b border-black/10 pb-4">
        <Link href="/noibo" className="text-xl font-black tracking-wide">
          NỘI BỘ
        </Link>
        <p className="mt-1 text-xs uppercase tracking-widest text-black/50">
          Millions Worldwide · Trang nội bộ
        </p>
      </header>
      {children}
    </main>
  );
}

export function NoiboNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      {message}
    </div>
  );
}

export function NoiboSectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-base font-bold">{children}</h2>;
}

/** Greeting header shared by every logged-in /noibo sub-page. */
export function NoiboHeader({ me }: { me: NoiboStaff }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-bold">Xin chào, {me.name}</h1>
        <p className="text-sm text-black/60">
          {me.role === "founder" ? "Founder" : "Nhân viên"} · @{me.username}
        </p>
      </div>
      <LogoutButton />
    </div>
  );
}
