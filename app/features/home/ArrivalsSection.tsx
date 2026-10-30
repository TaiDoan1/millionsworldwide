import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "../../data/products";
import { formatPrice } from "../../lib/format";

const FEATURED_IDS = ["set-hoodie-black", "tee-millions", "jeans-wide", "set-jeans-signature"];
const FEATURED_ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[2/3]", "aspect-[4/5]"];
const FEATURED_OFFSETS = ["md:pb-16", "md:pb-40", "", "md:pb-20"];

const featured = FEATURED_IDS.flatMap((id) => {
  const p = PRODUCTS.find((x) => x.id === id);
  return p ? [p] : [];
});

/** NEW ARRIVALS — featured pieces, data-driven from the catalog. */
export default function ArrivalsSection() {
  return (
    <section className="mx-auto mt-24 w-full max-w-[1400px] px-6 md:mt-36">
      <div className="mb-14 md:mb-20">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Selected Pieces
        </span>
        <h2 className="text-3xl font-medium tracking-tight md:text-4xl">NEW ARRIVALS</h2>
      </div>

      <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-4 md:gap-8">
        {featured.map((p, i) => (
          <Link key={p.id} href="/trangchu" className={`group col-span-1 ${FEATURED_OFFSETS[i] ?? ""}`}>
            <div
              className={`relative mb-4 overflow-hidden rounded-[12px] bg-[#F6F6F6] ${FEATURED_ASPECTS[i] ?? "aspect-[2/3]"}`}
            >
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 45vw, 22vw"
                className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.76,0,0.24,1)] group-hover:scale-105"
              />
            </div>
            <div className="flex items-baseline justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider">
              <span>{p.name}</span>
              <span className="whitespace-nowrap">{formatPrice(p.price)}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-14 flex w-full justify-end md:mt-16">
        <Link
          href="/trangchu"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-50"
        >
          View all <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
