import Image from "next/image";

const IG_IMAGES = ["/ig/ig-1.jpg", "/ig/ig-2.jpg", "/ig/ig-3.jpg", "/ig/ig-4.jpg"];

export default function InstagramSection() {
  return (
    <section className="mx-auto mt-28 w-full max-w-[1400px] px-6 text-center">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">follow us on instagram</h2>

      <a
        href="https://instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block bg-black px-8 py-3 text-base text-white transition-opacity hover:opacity-80"
      >
        view instagram
      </a>

      {/* Photo grid */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {IG_IMAGES.map((src, i) => (
          <a
            key={src}
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square overflow-hidden bg-neutral-100"
          >
            <Image
              src={src}
              alt={`instagram post ${i + 1}`}
              fill
              sizes="(max-width: 640px) 45vw, 22vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
