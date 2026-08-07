"use client";

import { useEffect, useState } from "react";

function format(d: Date): string {
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  let hours = d.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${mm}:${ss} ${ampm}`;
}

export default function Clock() {
  // Empty initial value avoids a hydration mismatch (server has no clock).
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    setNow(format(new Date()));
    const id = setInterval(() => setNow(format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time
      suppressHydrationWarning
      className="block text-sm font-bold tracking-wide tabular-nums"
    >
      {/* Non-breaking space keeps layout height stable before mount. */}
      {now || " "}
    </time>
  );
}
