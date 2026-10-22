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
      a: "message us via the contact page with your order code and the reason for the return. we will confirm and guide you through sending the item back — no account needed.",
    },
    {
      q: "when do i get my refund?",
      a: "once we receive and check the returned item, refunds are made by bank transfer within 3–5 business days.",
    },
    {
      q: "who pays for return shipping?",
      a: "return shipping is free when the item is faulty or we sent the wrong item. for other cases we will confirm any cost with you before you send it back.",
    },
    {
      q: "can i exchange for another size or item?",
      a: "yes — mention it in your message with your order code and we will arrange the exchange if the item is in stock.",
    },
  ],
  shipping: [
    {
      q: "how long does shipping take?",
      a: "orders are processed in 1–2 business days after confirmation, then delivered within 3–5 business days depending on your area.",
    },
    {
      q: "do you ship worldwide?",
      a: "we deliver nationwide across vietnam. for international orders, please contact us and we will assist you individually.",
    },
    {
      q: "how much is shipping?",
      a: "shipping is free on all orders — no minimum spend.",
    },
    {
      q: "how do i track my order?",
      a: "use the track order page with your order code and the phone number you ordered with. you can also inspect the items before paying on cod orders.",
    },
    {
      q: "how do i pay?",
      a: "pay cash on delivery (cod), or by bank transfer — we send the transfer details when confirming your order. see the payment policy page for details.",
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
