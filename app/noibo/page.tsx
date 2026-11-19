import type { Metadata } from "next";
import Link from "next/link";
import {
  getMyCheckinToday,
  getNoiboSessionStaffAction,
  getNoiboSettings,
  listCheckinWeek,
  listDailyLogs,
  listNoiboShifts,
  listNoiboStaff,
  listNoiboTasks,
} from "../actions/noibo";
import { NoiboNotice, NoiboSectionTitle, NoiboShell } from "./shell";
import NoiboLoginForm from "./NoiboLoginForm";
import { CheckinPanel } from "./checkin-client";
import {
  AddShiftForm,
  AddTaskForm,
  DailyLogForm,
  DeleteButton,
  LogoutButton,
  TaskBoard,
} from "./dashboard-client";
import {
  addDays,
  dayLabel,
  formatMinutes,
  mondayOf,
  summarizeCheckins,
  vnDateOf,
  vnTimeOf,
  vnToday,
  weekDates,
} from "./week";

export const metadata: Metadata = {
  title: "Nội bộ — Millions",
  robots: { index: false, follow: false },
};

export default async function NoiboPage({
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

  let settings;
  let tasks;
  let shifts;
  let staffList;
  let myCheckin;
  let weekSessions;
  let dailyLogs;
  try {
    [settings, tasks, shifts, staffList, myCheckin, weekSessions, dailyLogs] =
      await Promise.all([
        getNoiboSettings(),
        listNoiboTasks(),
        listNoiboShifts(dates[0], dates[6]),
        me.role === "founder" ? listNoiboStaff() : Promise.resolve([]),
        getMyCheckinToday(),
        me.role === "founder"
          ? listCheckinWeek(dates[0], dates[6])
          : Promise.resolve([]),
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

  const isFounder = me.role === "founder";
  const announcement = (settings.announcement ?? "").trim();
  const templates = settings.shiftTemplates ?? [];
  const shiftsByDate = new Map<string, typeof shifts>();
  for (const s of shifts) {
    const list = shiftsByDate.get(s.date) ?? [];
    list.push(s);
    shiftsByDate.set(s.date, list);
  }

  // Tasks due each day of the week (for the calendar) and tasks finished
  // today (for the end-of-day report).
  const tasksByDate = new Map<string, typeof tasks>();
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const list = tasksByDate.get(t.dueDate) ?? [];
    list.push(t);
    tasksByDate.set(t.dueDate, list);
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
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold">Xin chào, {me.name}</h1>
          <p className="text-sm text-black/60">
            {isFounder ? "Founder" : "Nhân viên"} · @{me.username}
          </p>
        </div>
        {isFounder ? (
          <Link
            href="/noibo/caidat"
            className="rounded-lg border border-black/20 px-3 py-1.5 text-sm"
          >
            Cài đặt
          </Link>
        ) : null}
        <LogoutButton />
      </div>

      <CheckinPanel
        open={myCheckin.open}
        todayMinutes={myCheckin.todayMinutes}
      />

      {announcement ? (
        <p className="mb-6 rounded-lg border border-black/10 bg-black/[0.03] p-4 text-sm">
          {announcement}
        </p>
      ) : null}

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <NoiboSectionTitle>Lịch làm việc</NoiboSectionTitle>
          <span className="flex items-center gap-2 text-sm">
            <Link
              href={`/noibo?week=${addDays(weekStart, -7)}`}
              className="rounded-lg border border-black/20 px-2 py-1"
            >
              ‹ Tuần trước
            </Link>
            {isCurrentWeek ? null : (
              <Link
                href="/noibo"
                className="rounded-lg border border-black/20 px-2 py-1"
              >
                Tuần này
              </Link>
            )}
            <Link
              href={`/noibo?week=${addDays(weekStart, 7)}`}
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

      <section className="mb-10">
        <NoiboSectionTitle>Báo cáo cuối ngày</NoiboSectionTitle>
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

      {isFounder ? (
        <section className="mb-10">
          <NoiboSectionTitle>Giờ làm tuần này</NoiboSectionTitle>
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
      ) : null}

      <section>
        <NoiboSectionTitle>Công việc</NoiboSectionTitle>
        <AddTaskForm staff={staffList} me={me} />
        <TaskBoard
          tasks={tasks}
          meId={me.id}
          isFounder={isFounder}
          today={today}
        />
      </section>
    </NoiboShell>
  );
}
