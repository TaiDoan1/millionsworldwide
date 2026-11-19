import type { Metadata } from "next";
import Link from "next/link";
import {
  getNoiboSessionStaffAction,
  getNoiboSettings,
  listNoiboShifts,
  listNoiboStaff,
  listNoiboTasks,
  type NoiboTask,
} from "../actions/noibo";
import { NoiboNotice, NoiboSectionTitle, NoiboShell } from "./shell";
import NoiboLoginForm from "./NoiboLoginForm";
import {
  AddShiftForm,
  AddTaskForm,
  DeleteButton,
  LogoutButton,
  TaskStatusButtons,
} from "./dashboard-client";
import { addDays, dayLabel, mondayOf, vnToday, weekDates } from "./week";

export const metadata: Metadata = {
  title: "Nội bộ — Millions",
  robots: { index: false, follow: false },
};

const TASK_GROUP_LABEL: Record<NoiboTask["status"], string> = {
  todo: "Chưa làm",
  doing: "Đang làm",
  done: "Đã xong",
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
  try {
    [settings, tasks, shifts, staffList] = await Promise.all([
      getNoiboSettings(),
      listNoiboTasks(),
      listNoiboShifts(dates[0], dates[6]),
      me.role === "founder" ? listNoiboStaff() : Promise.resolve([]),
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

        {isFounder ? (
          <AddShiftForm
            staff={staffList}
            dates={dates}
            templates={templates}
          />
        ) : null}

        <ul className="space-y-2">
          {dates.map((d) => {
            const dayShifts = shiftsByDate.get(d) ?? [];
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
                        {isFounder ? (
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
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <NoiboSectionTitle>Công việc</NoiboSectionTitle>
        {isFounder ? <AddTaskForm staff={staffList} /> : null}
        {(["todo", "doing", "done"] as const).map((status) => {
          const group = tasks.filter((t) => t.status === status);
          if (group.length === 0) return null;
          return (
            <div key={status} className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-black/60">
                {TASK_GROUP_LABEL[status]} ({group.length})
              </h3>
              <ul className="space-y-2">
                {group.map((t) => {
                  const overdue =
                    status !== "done" &&
                    t.dueDate !== null &&
                    t.dueDate < today;
                  const canChange =
                    isFounder || t.assigneeId === me.id;
                  return (
                    <li
                      key={t.id}
                      className="rounded-lg border border-black/10 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${
                            status === "done" ? "line-through text-black/50" : ""
                          }`}
                        >
                          {t.title}
                        </p>
                        {isFounder ? (
                          <DeleteButton
                            kind="task"
                            id={t.id}
                            label="Xóa công việc"
                          />
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-black/60">
                        {t.assigneeName ? `Giao cho ${t.assigneeName}` : "Chưa giao ai"}
                        {t.dueDate ? ` · Hạn ${t.dueDate}` : ""}
                        {overdue ? (
                          <span className="ml-1 font-semibold text-red-600">
                            · Quá hạn
                          </span>
                        ) : null}
                      </p>
                      {t.note ? (
                        <p className="mt-1 text-xs text-black/50">{t.note}</p>
                      ) : null}
                      {canChange ? (
                        <div className="mt-2">
                          <TaskStatusButtons taskId={t.id} status={t.status} />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {tasks.length === 0 ? (
          <p className="text-sm text-black/40">Chưa có công việc nào.</p>
        ) : null}
      </section>
    </NoiboShell>
  );
}
