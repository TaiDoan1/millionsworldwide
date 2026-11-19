"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkIn, checkOut, type NoiboCheckin } from "../actions/noibo";
import { formatMinutes, vnTimeOf } from "./week";

/** My check-in card on /noibo: check in on arrival, check out on leaving. */
export function CheckinPanel({
  open,
  todayMinutes,
}: {
  open: NoiboCheckin | null;
  todayMinutes: number;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function doCheckIn() {
    setMsg(null);
    setBusy(true);
    const result = await checkIn();
    setBusy(false);
    if (!result.success) {
      setMsg(result.error ?? "Check-in không được.");
      return;
    }
    router.refresh();
  }

  async function doCheckOut() {
    setMsg(null);
    setBusy(true);
    const result = await checkOut();
    setBusy(false);
    if (!result.success) {
      setMsg(result.error ?? "Check-out không được.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="mb-10 rounded-lg border border-black/10 p-4">
      <h2 className="mb-3 text-sm font-semibold">Chấm công</h2>
      {open ? (
        <p className="mb-3 text-sm">
          Đang làm từ{" "}
          <span className="font-semibold">{vnTimeOf(open.checkInAt)}</span>
          {" · "}Hôm nay: {formatMinutes(todayMinutes)}
        </p>
      ) : (
        <p className="mb-3 text-sm">Hôm nay: {formatMinutes(todayMinutes)}</p>
      )}
      {open ? (
        <button
          onClick={doCheckOut}
          disabled={busy}
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Đang lưu…" : "Check-out"}
        </button>
      ) : (
        <button
          onClick={doCheckIn}
          disabled={busy}
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Đang lưu…" : "Check-in"}
        </button>
      )}
      {msg ? <p className="mt-2 text-sm text-red-600">{msg}</p> : null}
    </section>
  );
}
