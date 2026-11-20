import type { Metadata } from "next";
import Link from "next/link";
import {
  getNoiboSessionStaffAction,
  getNoiboSettings,
  listNoiboShifts,
  listNoiboStaff,
  listNoiboTasks,
} from "../../actions/noibo";
import { NoiboHeader, NoiboNotice, NoiboSectionTitle, NoiboShell } from "../shell";
import { NoiboNav } from "../nav";
import NoiboLoginForm from "../NoiboLoginForm";
import { AddShiftForm, DeleteButton } from "../dashboard-client";
import {
  addDays,
  dayLabel,
  mondayOf,
  vnToday,
  weekDates,
} from "../week";

export const metadata: Metadata = {
  title: "Lịch làm việc — Nội bộ",
  robots: { index: false, follow: false },
};

/** /noibo/lich — week schedule: shifts + tasks due each day. */
export default async function NoiboLichPage({
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

  let settings;
  let tasks;
  let shifts;
  let staffList;
  try {
    [settings, tasks, shifts, staffList] = await Promise.all([
      getNoiboSettings(),
      listNoiboTasks(),
      listNoiboShifts(dates[0], dates[6]),
      isFounder ? listNoiboStaff() : Promise.resolve([]),
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

  const templates = settings.shiftTemplates ?? [];
  const shiftsByDate = new Map<string, typeof shifts>();
  for (const s of shifts) {
    const list = shiftsByDate.get(s.date) ?? [];
    list.push(s);
    shiftsByDate.set(s.date, list);
  }
  const tasksByDate = new Map<string, typeof tasks>();
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const list = tasksByDate.get(t.dueDate) ?? [];
    list.push(t);
    tasksByDate.set(t.dueDate, list);
  }

  return (
    <NoiboShell>
      <NoiboHeader me={me} />
      <NoiboNav isFounder={isFounder} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <NoiboSectionTitle>Lịch làm việc</NoiboSectionTitle>
          <span className="flex items-center gap-2 text-sm">
            <Link
              href={`/noibo/lich?week=${addDays(weekStart, -7)}`}
              className="rounded-lg border border-black/20 px-2 py-1"
            >
              ‹ Tuần trước
            </Link>
            {isCurrentWeek ? null : (
              <Link
                href="/noibo/lich"
                className="rounded-lg border border-black/20 px-2 py-1"
              >
                Tuần này
              </Link>
            )}
            <Link
              href={`/noibo/lich?week=${addDays(weekStart, 7)}`}
              className="rounded-lg border border-black/20 px-2 py-1"
            >
              Tuần sau ›
            </Link>
          </span>
        </div>

        <AddShiftForm
          staff={staffList}
          dates={dates}
          templates={templates}
          me={me}
        />

        <ul className="space-y-2">
          {dates.map((d) => {
            const dayShifts = shiftsByDate.get(d) ?? [];
            const dayTasks = tasksByDate.get(d) ?? [];
            const isToday = d === today;
            return (
              <li
                key={d}
                className={`rounded-lg border p-3 ${
                  isToday
                    ? "border-black bg-black/[0.04]"
                    : "border-black/10"
                }`}
              >
                <p className="mb-2 text-sm font-semibold">
                  {dayLabel(d)}
                  {isToday ? (
                    <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-xs text-white">
                      Hôm nay
                    </span>
                  ) : null}
                </p>
                {dayShifts.length === 0 ? (
                  <p className="text-sm text-black/40">Chưa xếp ca.</p>
                ) : (
                  <ul className="space-y-1">
                    {dayShifts.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-start justify-between gap-2 text-sm"
                      >
                        <span>
                          <span className="font-medium">
                            {s.staffName ?? "—"}
                          </span>
                          {" · "}
                          {s.label}
                          {s.note ? (
                            <span className="text-black/50"> — {s.note}</span>
                          ) : null}
                        </span>
                        {isFounder || s.staffId === me.id ? (
                          <DeleteButton
                            kind="shift"
                            id={s.id}
                            label="Xóa ca làm"
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
                {dayTasks.length > 0 ? (
                  <ul className="mt-2 space-y-1 border-t border-black/10 pt-2">
                    {dayTasks.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            t.status === "done"
                              ? "bg-green-600"
                              : t.status === "doing"
                                ? "bg-amber-500"
                                : "bg-black/30"
                          }`}
                        />
                        <span>
                          {t.title}
                          <span className="text-black/50">
                            {" · "}
                            {t.status === "done"
                              ? "Đã xong"
                              : t.status === "doing"
                                ? "Đang làm"
                                : "Chưa làm"}
                          </span>
                          {t.assigneeName ? (
                            <span className="text-black/50">
                              {" · "}
                              {t.assigneeName}
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
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </NoiboShell>
  );
}
