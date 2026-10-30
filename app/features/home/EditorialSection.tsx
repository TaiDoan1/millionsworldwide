import Image from "next/image";
import Link from "next/link";

const DEFAULT_HEADING = ["FASHION", "WITHOUT", "THE SHOUT"];
const DEFAULT_TEXT =
  "Millions is built for those who choose form over noise — and let the work speak where words don't have to. Mỗi thiết kế bắt đầu từ phom dáng, chất liệu và chi tiết dập nổi đặc trưng, được làm tại Việt Nam cho người mặc ở khắp nơi.";

/** Brand statement + editorial image. Heading/text come from /mw-office when set. */
export default function EditorialSection({
  heading,
  text,
}: {
  heading?: string;
  text?: string;
}) {
  const lines = (heading ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const title = lines.length > 0 ? lines : DEFAULT_HEADING;
  const paragraph = (text ?? "").trim() || DEFAULT_TEXT;

  return (
    <section className="mx-auto mt-24 w-full max-w-[1400px] px-6 md:mt-36">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            The Millions story
          </span>
          <h2 className="text-4xl font-bold leading-[1.02] tracking-tight md:text-6xl">
            {title.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-neutral-600">
            {paragraph}
          </p>
          <Link
            href="/about"
            className="mt-10 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-opacity hover:opacity-50"
          >
            Về Millions <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] bg-[#F6F6F6]">
          <Image
            src="/products/jacket-black-1.jpg"
            alt="Millions black stitch jacket"
            fill
            sizes="(max-width: 768px) 92vw, 45vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
