"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setDone(true);
      }}
      className="mt-6 max-w-md"
    >
      <div className="flex items-center gap-3 border-b border-black pb-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
        />
        <button type="submit" aria-label="Subscribe" className="transition-opacity hover:opacity-60">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12" />
            <polyline points="14 6 20 12 14 18" />
          </svg>
        </button>
      </div>
      {done && <p className="mt-3 text-sm text-neutral-500">thanks for subscribing!</p>}
      <p className="mt-4 text-sm">
        by subscribing, you agree to our{" "}
        <a href="/privacy-policy" className="underline">privacy policy</a>.
      </p>
    </form>
  );
}
