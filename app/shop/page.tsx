import Image from "next/image";
import CollectionHeader from "../components/CollectionHeader";
import ShopSection from "../components/ShopSection";
import CollectionFooter from "../components/CollectionFooter";

export const metadata = {
  title: "products — millions worldwide™",
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <CollectionHeader />

      <main className="w-full">
        {/* Hero — 5:4 banner (reference image file is 2560×2048), 12px radius, centred title */}
        <div className="px-0 pt-[110px] sm:px-[44px] sm:pt-[106px]">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-b-[12px] sm:rounded-[12px]">
            <Image
              src="/ig/banner.jpg"
              alt="Millions Worldwide collection"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <h1 className="absolute inset-0 flex items-center justify-center text-[24px] font-normal text-white lg:text-[27px]">
              Products
            </h1>
          </div>
        </div>

        <div className="mt-[clamp(1rem,0.62588rem+1.59624vw,2.25rem)]">
          <ShopSection />
        </div>
      </main>

      <CollectionFooter />
    </div>
  );
}
