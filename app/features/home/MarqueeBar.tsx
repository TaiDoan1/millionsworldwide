const DEFAULT_PHRASES = [
  "Millions Worldwide™",
  "Form over noise",
  "The online launch — 01.11.2026",
  "Miễn phí vận chuyển toàn quốc",
  "Designed in Vietnam",
  "New drop — 17 pieces",
];

/** Black ticker under the hero, looping the brand phrases twice. */
export default function MarqueeBar({ phrases }: { phrases?: string[] }) {
  const list = phrases && phrases.length > 0 ? phrases : DEFAULT_PHRASES;
  return (
    <section aria-hidden className="mt-4 overflow-hidden bg-black py-3 text-white md:mt-6">
      <div className="mw-marquee flex w-max items-center whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.25em]">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center">
            {list.map((phrase) => (
              <span key={`${half}-${phrase}`} className="flex items-center">
                <span className="px-8">{phrase}</span>
                <span className="text-[10px]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
