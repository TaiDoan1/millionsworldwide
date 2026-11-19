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
