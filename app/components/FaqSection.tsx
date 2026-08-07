"use client";

import { useState } from "react";

type Faq = { q: string; a: string };

const FAQS: Record<"returns" | "shipping", Faq[]> = {
  returns: [
    {
      q: "are there any return restrictions?",
      a: "items must be returned unworn, unwashed and with all original tags attached within 14 days of delivery.",
    },
    {
      q: "how can i make a return?",
      a: "log in to your account, open the order and select the items you wish to return to generate a prepaid label.",
    },
    {
      q: "i have lost the return label.",
      a: "contact our support team with your order number and we will re-issue a return label for you.",
    },
    {
      q: "i have lost the return proforma invoice.",
      a: "no problem — a copy of your invoice is always available in the order details of your account.",
    },
    {
      q: "how do i create a return?",
      a: "head to the track order page, enter your details and follow the guided return steps.",
    },
  ],
  shipping: [
    {
      q: "how long does shipping take?",
      a: "standard shipping takes 3–5 business days. express options are shown at checkout.",
    },
    {
      q: "do you ship worldwide?",
      a: "yes — we ship to most countries. duties and taxes are calculated at checkout.",
    },
    {
      q: "how much is shipping?",
      a: "shipping is free on all orders. express delivery is available for an additional fee.",
    },
    {
      q: "how do i track my order?",
      a: "use the track order page with the tracking number sent to your email after dispatch.",
    },
  ],
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function FaqSection() {
  const [tab, setTab] = useState<"returns" | "shipping">("returns");
  const [open, setOpen] = useState<number | null>(null);

  const items = FAQS[tab];

  return (
    <section className="mx-auto mt-32 w-full max-w-[1000px] px-6">
      <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">
        frequently asked questions
      </h2>
      <p className="mt-4 text-center text-neutral-500">
        find answers by selecting a category below
      </p>

      {/* Tabs */}
      <div className="mt-10 flex justify-center gap-3">
        {(["returns", "shipping"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setOpen(null);
            }}
            className={`min-w-[110px] border border-black px-6 py-3 transition-colors ${
              tab === t ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="mt-12">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border-b border-neutral-200">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="pr-4 font-medium">{item.q}</span>
                <Chevron open={isOpen} />
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <p className="overflow-hidden text-neutral-500">{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
