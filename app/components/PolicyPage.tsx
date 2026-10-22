import type { ReactNode } from "react";
import SiteFooter from "./SiteFooter";

/**
 * Shared shell for the info/policy pages linked from the footers and menus
 * (about, contact, policies...). The global header comes from the root layout.
 */
export default function PolicyPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <main className="mx-auto w-full max-w-[820px] px-6 pb-24 pt-36 sm:pt-44">
        <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-black sm:text-4xl">
          {title}
        </h1>
        <div className="mt-4 text-[15px] leading-relaxed text-neutral-600 [&_a]:font-semibold [&_a]:text-black [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-1 [&_h2]:mt-9 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-black [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
