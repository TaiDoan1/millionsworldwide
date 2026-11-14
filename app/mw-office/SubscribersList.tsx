"use client";

import { useMemo, useState } from "react";
import { Pager } from "./ui-client";

const PAGE_SIZE = 20;

type Subscriber = { email: string; source: string; at: string };

/** Email list with pagination — the list only grows, so it no longer
 *  renders every address on one long page. */
export default function SubscribersList({
  subscribers,
}: {
  subscribers: Subscriber[];
}) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(subscribers.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pageItems = useMemo(
    () =>
      subscribers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [subscribers, safePage],
  );

  return (
    <div>
      <ul className="divide-y divide-neutral-100 text-base">
        {pageItems.map((s) => (
          <li key={s.email} className="flex flex-wrap justify-between gap-2 py-2.5">
            <span className="font-medium">{s.email}</span>
            <span className="text-gray-600">
              {s.source} · {new Date(s.at).toLocaleString("vi-VN")}
            </span>
          </li>
        ))}
      </ul>
      <Pager page={safePage} pages={pages} onPage={setPage} />
    </div>
  );
}
