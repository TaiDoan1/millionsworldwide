import { Inter } from "next/font/google";
import type { Metadata } from "next";
import CollectionHeader from "../components/CollectionHeader";
import ShopSection from "../components/ShopSection";
import CollectionFooter from "../components/CollectionFooter";
import { getProducts } from "../actions/products";
import { getCategories } from "../actions/categories";
import { getSettings } from "../actions/settings";

/**
 * The reference shop renders everything in "Swiss" (a licensed Helvetica-style
 * grotesque served from another store's CDN). Inter is its closest free metric
 * match, so the trangchu page uses it instead of the site's Archivo.
 */
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "products — millions worldwide™",
  alternates: {
    canonical: "/trangchu",
  },
};

export default async function TrangChuPage() {
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getSettings(),
  ]);
  // The promo strip is 30px tall; when it shows, the floating header and
  // the content below it both shift down by exactly that much.
  const promoBar =
    settings.promoEnabled === true &&
    (settings.promoText ?? "").trim().length > 0;

  return (
    <div className={`min-h-screen bg-white text-black ${inter.className}`}>
      <CollectionHeader products={products} categories={categories} promoBar={promoBar} />

      <main className="w-full">
        {/* Hero — sized with the reference homepage hero's own formula:
            height calc(100vh - 2rem); from 760px up, calc(100vh - 5rem) capped at
            calc(100vh - 4.5vw). 12px radius, no overlay title. Autoplay, muted, loop. */}
        <div className={`px-0 sm:px-[44px] ${promoBar ? "pt-[140px] sm:pt-[136px]" : "pt-[110px] sm:pt-[106px]"}`}>
          <div className="relative h-[calc(100vh-2rem)] min-[760px]:h-[calc(100vh-5rem)] min-[760px]:max-h-[calc(100vh-4.5vw)] w-full overflow-hidden rounded-b-[12px] sm:rounded-[12px]">
            <video
              src="/videos/desktop.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/ig/banner.jpg"
              aria-label="Millions Worldwide collection"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-[1.25rem] sm:mt-[2.25vw]">
          <ShopSection products={products} categories={categories} />
        </div>
      </main>

      <CollectionFooter whatsappUrl={settings.whatsappUrl} />
    </div>
  );
}
