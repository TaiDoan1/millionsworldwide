import Image from "next/image";
import { EASE } from "./constants";

/** Detail-page gallery: photos stack and crossfade on switch. */
export default function ProductGallery({
  images,
  name,
  soldOut,
  selected,
  onSelect,
  onPrev,
  onNext,
}: {
  images: string[];
  name: string;
  soldOut?: boolean;
  selected: number;
  onSelect: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const count = images.length;
  return (
    <div>
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[12px] bg-[#f5f5f5]">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === selected ? name : ""}
            aria-hidden={i !== selected}
            fill
            priority={i === 0}
            sizes="(max-width: 1023px) 100vw, 55vw"
            className={`object-cover transition-opacity duration-700 ${EASE} ${
              i === selected ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {soldOut && (
          <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
            <span className="flex h-[85px] w-[85px] items-center justify-center rounded-full border-[1.5px] border-[#d46b78] bg-[#f0a0a9] text-center text-xs font-semibold uppercase leading-tight tracking-[1.5px] text-white">
              Sold
              <br />
              Out
            </span>
          </div>
        )}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={onPrev}
              aria-label="Ảnh trước"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow transition hover:bg-white"
            >
              ←
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Ảnh sau"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow transition hover:bg-white"
            >
              →
            </button>
            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
              {selected + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Xem ảnh ${i + 1}`}
              className={`relative aspect-[2/3] w-[72px] shrink-0 overflow-hidden rounded-[8px] bg-[#f5f5f5] transition-all duration-700 ${EASE} ${
                i === selected
                  ? "ring-2 ring-black ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt=""
                aria-hidden
                fill
                sizes="72px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
