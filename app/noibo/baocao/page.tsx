import type { Metadata } from "next";
import Link from "next/link";
import {
  getNoiboSessionStaffAction,
  getNoiboSettings,
  listDailyLogs,
  listNoiboTasks,
} from "../../actions/noibo";
import { NoiboHeader, NoiboNotice, NoiboSectionTitle, NoiboShell } from "../shell";
import { NoiboNav } from "../nav";
import NoiboLoginForm from "../NoiboLoginForm";
import { DailyLogForm } from "../dashboard-client";
import {
  addDays,
  dayLabel,
  mondayOf,
  vnDateOf,
  vnTimeOf,
  vnToday,
  weekDates,
} from "../week";

export const metadata: Metadata = {
  title: "Báo cáo cuối ngày — Nội bộ",
  robots: { index: false, follow: false },
};

/** /noibo/baocao — end-of-day report: tasks finished today + daily summary. */
export default async function NoiboBaocaoPage({
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

  const { week } = await searchParams;
  const weekStart = mondayOf(
    week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : vnToday()
  );
  const dates = weekDates(weekStart);
  const today = vnToday();
  const isCurrentWeek = weekStart === mondayOf(today);
  const isFounder = me.role === "founder";

  let tasks;
  let dailyLogs;
  try {
    [tasks, dailyLogs] = await Promise.all([
      listNoiboTasks(),
      listDailyLogs(dates[0], dates[6]),
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

  const doneToday = tasks.filter(
    (t) =>
      t.status === "done" &&
      t.completedAt &&
      vnDateOf(t.completedAt) === today &&
      (isFounder || t.assigneeId === me.id)
  );

  return (
    <NoiboShell>
      <NoiboHeader me={me} />
      <NoiboNav isFounder={isFounder} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <NoiboSectionTitle>Báo cáo cuối ngày</NoiboSectionTitle>
          <span className="flex items-center gap-2 text-sm">
            <Link
              href={`/noibo/baocao?week=${addDays(weekStart, -7)}`}
              className="rounded-lg border border-black/20 px-2 py-1"
            >
              ‹ Tuần trước
            </Link>
            {isCurrentWeek ? null : (
              <Link
                href="/noibo/baocao"
                className="rounded-lg border border-black/20 px-2 py-1"
              >
                Tuần này
              </Link>
            )}
            <Link
              href={`/noibo/baocao?week=${addDays(weekStart, 7)}`}
              className="rounded-lg border border-black/20 px-2 py-1"
            >
              Tuần sau ›
            </Link>
          </span>
        </div>

        {doneToday.length === 0 ? (
          <p className="mb-4 text-sm text-black/40">
            Hôm nay chưa xong việc nào.
          </p>
        ) : (
          <ul className="mb-4 space-y-1">
            {doneToday.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <span className="text-green-700">✓</span>
                <span>
                  {t.title}
                  {isFounder && t.assigneeName ? (
                    <span className="text-black/50">
                      {" · "}
                      {t.assigneeName}
                    </span>
                  ) : null}
                  {t.completedAt ? (
                    <span className="text-black/50">
                      {" · "}
                      {vnTimeOf(t.completedAt)} xong
                    </span>
                  ) : null}
                  {t.priority === "high" ? (
                    <span className="font-semibold text-red-600">
                      {" · Ưu tiên"}
                    </span>
                  ) : (
                    <span className="font-semibold text-yellow-600">
                      {" · Bình thường"}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        <DailyLogForm
          dates={dates}
          myLogs={dailyLogs.filter((l) => l.staffId === me.id)}
          today={today}
        />
        {dailyLogs.length === 0 ? (
          <p className="text-sm text-black/40">Chưa ai viết công việc tuần này.</p>
        ) : (
          <ul className="space-y-2">
            {dailyLogs.map((l) => (
              <li
                key={l.id}
                className="rounded-lg border border-black/10 p-3"
              >
                <p className="mb-1 text-xs text-black/60">
                  {dayLabel(l.date)}
                  {isFounder && l.staffName ? ` · ${l.staffName}` : ""}
                </p>
                <p className="whitespace-pre-wrap text-sm">{l.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </NoiboShell>
  );
}
