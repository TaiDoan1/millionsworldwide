const MESSAGES = [
  "millions worldwide™",
  "welcome to millions worldwide",
  "new collection available",
  "free shipping",
];

export default function AnnouncementBar() {
  // Duplicate the sequence so the -50% marquee loop is seamless.
  const sequence = [...MESSAGES, ...MESSAGES];

  return (
    <div className="overflow-hidden bg-black py-2 text-white">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {sequence.map((msg, i) => (
              <li
                key={`${copy}-${i}`}
                className="flex items-center whitespace-nowrap text-xs font-medium tracking-wide"
              >
                <span className="px-8">{msg}</span>
                <span className="text-white/40">|</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
