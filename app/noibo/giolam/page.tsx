import type { Metadata } from "next";
import Link from "next/link";
import {
  getNoiboSessionStaffAction,
  getNoiboSettings,
  listCheckinWeek,
  listNoiboStaff,
} from "../../actions/noibo";
import { NoiboHeader, NoiboNotice, NoiboSectionTitle, NoiboShell } from "../shell";
import { NoiboNav } from "../nav";
import NoiboLoginForm from "../NoiboLoginForm";
import {
  addDays,
  formatMinutes,
  mondayOf,
  summarizeCheckins,
  vnTimeOf,
  vnToday,
  weekDates,
} from "../week";

export const metadata: Metadata = {
  title: "Giờ làm — Nội bộ",
  robots: { index: false, follow: false },
};

/** /noibo/giolam — founder-only: staff working hours for the week. */
export default async function NoiboGiolamPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const me = await getNoiboSessionStaffAction();
  if (!me) {
    let dbError: string | null = null;
    try {
      await getNoiboSettings();
    } catch (error) {
      dbError = error instanceof Error ? error.message : "Có lỗi xảy ra.";
    }
    return (
      <NoiboShell>
        {dbError ? <NoiboNotice message={dbError} /> : <NoiboLoginForm />}
      </NoiboShell>
    );
  }
  if (me.role !== "founder") {
    return (
      <NoiboShell>
        <NoiboHeader me={me} />
        <NoiboNav isFounder={false} />
        <NoiboNotice message="Chỉ founder mới xem được giờ làm của nhân viên." />
        <p className="mt-4 text-sm">
          <Link href="/noibo" className="underline">
            ← Quay lại trang nội bộ
          </Link>
        </p>
      </NoiboShell>
    );
  }

  const { week } = await searchParams;
  const weekStart = mondayOf(
    week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : vnToday()
  );
  const dates = weekDates(weekStart);
  const today = vnToday();
  const isCurrentWeek = weekStart === mondayOf(today);

  let staffList;
  let weekSessions;
  try {
    [staffList, weekSessions] = await Promise.all([
      listNoiboStaff(),
      listCheckinWeek(dates[0], dates[6]),
    ]);
  } catch (error) {
    return (
      <NoiboShell>
        <NoiboNotice
          message={error instanceof Error ? error.message : "Có lỗi xảy ra."}
        />
      </NoiboShell>
    );
  }

  return (
    <NoiboShell>
      <NoiboHeader me={me} />
      <NoiboNav isFounder />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <NoiboSectionTitle>Giờ làm tuần này</NoiboSectionTitle>
          <span className="flex items-center gap-2 text-sm">
            <Link
              href={`/noibo/giolam?week=${addDays(weekStart, -7)}`}
              className="rounded-lg border border-black/20 px-2 py-1"
            >
              ‹ Tuần trước
            </Link>
            {isCurrentWeek ? null : (
              <Link
                href="/noibo/giolam"
                className="rounded-lg border border-black/20 px-2 py-1"
              >
                Tuần này
              </Link>
            )}
            <Link
              href={`/noibo/giolam?week=${addDays(weekStart, 7)}`}
              className="rounded-lg border border-black/20 px-2 py-1"
            >
              Tuần sau ›
            </Link>
          </span>
        </div>
        <ul className="space-y-2">
          {summarizeCheckins(
            weekSessions,
            staffList,
            dates,
            today,
            new Date().toISOString()
          ).map((r) => (
            <li
              key={r.staffId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/10 p-3 text-sm"
            >
              <span className="font-medium">{r.name}</span>
              <span className="text-black/60">
                Hôm nay: {formatMinutes(r.todayMinutes)}
                {" · "}Tuần này: {formatMinutes(r.totalMinutes)}
                {r.openSince ? (
                  <>{" · "}Đang làm từ {vnTimeOf(r.openSince)}</>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </NoiboShell>
  );
}
