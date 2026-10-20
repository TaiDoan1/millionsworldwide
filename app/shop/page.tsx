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
        {/* Hero — ~5:4 editorial image with centred title, like the reference collection page */}
        <div className="px-10 pt-[135px]">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl">
            <Image
              src="/ig/banner.jpg"
              alt="Millions Worldwide collection"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <h1 className="absolute left-1/2 top-[65%] -translate-x-1/2 text-[28px] font-medium text-white sm:text-[30px]">
              Products
            </h1>
          </div>
        </div>

        <div className="mt-14">
          <ShopSection />
        </div>
      </main>

      <CollectionFooter />
    </div>
  );
}
