/**
 * Pure date helpers for the internal staff schedule (/noibo).
 * All dates are "YYYY-MM-DD" strings; the shop's week runs Monday to
 * Sunday in Asia/Ho_Chi_Minh.
 */

export function vnToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

export function addDays(dateStr: string, n: number): string {
  const d = parseDay(dateStr);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function mondayOf(dateStr: string): string {
  const dow = parseDay(dateStr).getUTCDay(); // 0 = Sunday
  return addDays(dateStr, -((dow + 6) % 7));
}

export function weekDates(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

const WEEKDAY_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** "T2 19/11" style label for a date. */
export function dayLabel(dateStr: string): string {
  const d = parseDay(dateStr);
  const wd = WEEKDAY_VI[d.getUTCDay()];
  const [, m, day] = dateStr.split("-");
  return `${wd} ${day}/${m}`;
}

/** VN calendar date (YYYY-MM-DD) of an ISO timestamp. */
export function vnDateOf(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** "HH:mm" clock time of an ISO timestamp in VN time. */
export function vnTimeOf(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** ISO instant of 00:00 VN time on the given VN date. */
export function vnDayStartIso(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00+07:00`).toISOString();
}

/** "7 giờ 30 phút" / "45 phút" / "0 phút". */
export function formatMinutes(total: number): string {
  const m = Math.max(0, Math.round(total));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${rest} phút`;
  if (rest === 0) return `${h} giờ`;
  return `${h} giờ ${rest} phút`;
}

/** One check-in session, as summarizeCheckins consumes it. */
export type CheckinSessionInput = {
  staffId: number;
  checkInAt: string;
  checkOutAt: string | null;
};

export type CheckinWeekRow = {
  staffId: number;
  name: string;
  /** Total minutes worked in the week (open sessions count until now). */
  totalMinutes: number;
  /** Minutes worked on `today`. */
  todayMinutes: number;
  /** ISO check-in time of the currently open session, if any. */
  openSince: string | null;
};

/**
 * Per-staff week summary from raw sessions. A session counts toward
 * its VN check-in day (a session crossing midnight stays on its start
 * day). Open sessions count until `nowIso`.
 */
export function summarizeCheckins(
  sessions: CheckinSessionInput[],
  staff: { id: number; name: string }[],
  days: string[],
  today: string,
  nowIso: string
): CheckinWeekRow[] {
  const now = new Date(nowIso).getTime();
  const rows: CheckinWeekRow[] = staff.map((s) => ({
    staffId: s.id,
    name: s.name,
    totalMinutes: 0,
    todayMinutes: 0,
    openSince: null,
  }));
  const byId = new Map(rows.map((r) => [r.staffId, r]));
  for (const s of sessions) {
    const row = byId.get(s.staffId);
    if (!row) continue;
    const day = vnDateOf(s.checkInAt);
    if (!days.includes(day)) continue;
    const end = s.checkOutAt ? new Date(s.checkOutAt).getTime() : now;
    const minutes = Math.max(
      0,
      (end - new Date(s.checkInAt).getTime()) / 60000
    );
    row.totalMinutes += minutes;
    if (day === today) row.todayMinutes += minutes;
    if (!s.checkOutAt) row.openSince = s.checkInAt;
  }
  return rows;
}
