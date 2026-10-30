import Image from "next/image";
import Link from "next/link";

const COLLECTION_TILES = [
  { label: "The Sets", img: "/products/set-hoodie-black-1.jpg", alt: "Millions black hoodie set" },
  { label: "Signature Denim", img: "/products/set-jeans-signature-1.jpg", alt: "Millions signature denim set" },
  { label: "Tees & Tanks", img: "/products/tee-millions-1.jpg", alt: "Millions worldwide tee" },
];

/** SHOP BY STORY — the three collection tiles. */
export default function StoryTiles() {
  return (
    <section className="mx-auto mt-24 w-full max-w-[1400px] px-6 md:mt-32">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Collections
          </span>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">SHOP BY STORY</h2>
        </div>
        <Link
          href="/trangchu"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-50"
        >
          View all <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {COLLECTION_TILES.map((tile) => (
          <Link
            key={tile.label}
            href="/trangchu"
            className="group relative block aspect-[2/3] overflow-hidden rounded-[12px] bg-[#F6F6F6]"
          >
            <Image
              src={tile.img}
              alt={tile.alt}
              fill
              sizes="(max-width: 640px) 92vw, 31vw"
              className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.76,0,0.24,1)] group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-white">
              <span className="text-lg font-bold uppercase tracking-wide md:text-xl">{tile.label}</span>
              <span className="text-xl transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
