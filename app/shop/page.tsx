import { Inter } from "next/font/google";
import CollectionHeader from "../components/CollectionHeader";
import ShopSection from "../components/ShopSection";
import CollectionFooter from "../components/CollectionFooter";

/**
 * The reference shop renders everything in "Swiss" (a licensed Helvetica-style
 * grotesque served from another store's CDN). Inter is its closest free metric
 * match, so the shop page uses it instead of the site's Archivo.
 */
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "products — millions worldwide™",
};

export default function ShopPage() {
  return (
    <div className={`min-h-screen bg-white text-black ${inter.className}`}>
      <CollectionHeader />

      <main className="w-full">
        {/* Hero — the frame matches the hero video's native 16:9 so the video fits
            exactly (no zoom/crop), 12px radius, centred title. Autoplay, muted, loop. */}
        <div className="px-0 pt-[110px] sm:px-[44px] sm:pt-[106px]">
          <div className="relative aspect-video w-full overflow-hidden rounded-b-[12px] sm:rounded-[12px]">
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
            <h1 className="absolute inset-0 flex items-center justify-center text-[24px] font-normal text-white lg:text-[27px]">
              Products
            </h1>
          </div>
        </div>

        <div className="mt-[1.25rem] sm:mt-[2.25vw]">
          <ShopSection />
        </div>
      </main>

      <CollectionFooter />
    </div>
  );
}
