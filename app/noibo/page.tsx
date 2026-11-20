import type { Metadata } from "next";
import Link from "next/link";
import {
  getMyCheckinToday,
  getNoiboSessionStaffAction,
  getNoiboSettings,
  listNoiboStaff,
  listNoiboTasks,
} from "../actions/noibo";
import { NoiboHeader, NoiboNotice, NoiboShell } from "./shell";
import { NoiboNav } from "./nav";
import NoiboLoginForm from "./NoiboLoginForm";
import { CheckinPanel } from "./checkin-client";
import { vnDateOf, vnToday } from "./week";

export const metadata: Metadata = {
  title: "Nội bộ — Millions",
  robots: { index: false, follow: false },
};

/**
 * /noibo — Tổng quan: the daily landing page. Check-in first, then the
 * announcement and shortcut cards to the sub-pages. The other sections
 * live on their own pages (/noibo/lich, /viec, /baocao, /giolam).
 */
export default async function NoiboPage() {
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

  const isFounder = me.role === "founder";
  const today = vnToday();

  let settings;
  let myCheckin;
  let tasks;
  let staffList;
  try {
    [settings, myCheckin, tasks, staffList] = await Promise.all([
      getNoiboSettings(),
      getMyCheckinToday(),
      listNoiboTasks(),
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

  const announcement = (settings.announcement ?? "").trim();
  const myTasks = isFounder
    ? tasks
    : tasks.filter((t) => t.assigneeId === me.id);
  const openTasks = myTasks.filter((t) => t.status !== "done");
  const overdueTasks = openTasks.filter(
    (t) => t.dueDate && t.dueDate < today
  );
  const doneToday = myTasks.filter(
    (t) =>
      t.status === "done" &&
      t.completedAt &&
      vnDateOf(t.completedAt) === today
  );

  // Founder's progress board: one row per active staff member.
  const progress = staffList
    .filter((s) => s.active)
    .map((s) => {
      const mine = tasks.filter((t) => t.assigneeId === s.id);
      return {
        id: s.id,
        name: s.name,
        total: mine.length,
        done: mine.filter((t) => t.status === "done").length,
        doing: mine.filter((t) => t.status === "doing").length,
        overdue: mine.filter(
          (t) => t.status !== "done" && t.dueDate && t.dueDate < today
        ).length,
      };
    });
  const unassignedCount = tasks.filter((t) => t.assigneeId === null).length;

  return (
    <NoiboShell>
      <NoiboHeader me={me} />
      <NoiboNav isFounder={isFounder} />

      <CheckinPanel
        open={myCheckin.open}
        todayMinutes={myCheckin.todayMinutes}
      />

      {announcement ? (
        <p className="mb-6 rounded-lg border border-black/10 bg-black/[0.03] p-4 text-sm">
          {announcement}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/noibo/lich"
          className="rounded-lg border border-black/10 p-4 hover:border-black/40"
        >
          <p className="text-sm font-semibold">Lịch làm</p>
          <p className="mt-1 text-sm text-black/60">
            Xem ca làm tuần này, đăng ký ca mới.
          </p>
        </Link>
        <Link
          href="/noibo/viec"
          className="rounded-lg border border-black/10 p-4 hover:border-black/40"
        >
          <p className="text-sm font-semibold">Công việc</p>
          <p className="mt-1 text-sm text-black/60">
            {openTasks.length === 0
              ? "Không còn việc đang làm."
              : `${openTasks.length} việc đang làm${
                  overdueTasks.length > 0
                    ? ` · ${overdueTasks.length} việc quá hạn`
                    : ""
                }.`}
          </p>
        </Link>
        <Link
          href="/noibo/baocao"
          className="rounded-lg border border-black/10 p-4 hover:border-black/40"
        >
          <p className="text-sm font-semibold">Báo cáo</p>
          <p className="mt-1 text-sm text-black/60">
            {doneToday.length === 0
              ? "Hôm nay chưa xong việc nào."
              : `Hôm nay đã xong ${doneToday.length} việc.`}{" "}
            Viết tóm tắt ngày.
          </p>
        </Link>
      </div>

      {isFounder ? (
        <section className="mt-8">
          <h2 className="mb-3 text-base font-bold">Tiến độ nhân viên</h2>
          {progress.length === 0 ? (
            <p className="text-sm text-black/40">Chưa có nhân viên nào.</p>
          ) : (
            <ul className="space-y-2">
              {progress.map((r) => {
                const pct =
                  r.total > 0 ? Math.round((r.done / r.total) * 100) : 0;
                return (
                  <li
                    key={r.id}
                    className="space-y-2 rounded-lg border border-black/10 p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{r.name}</span>
                      <span className="text-black/60">
                        Đã xong {r.done}/{r.total}
                        {r.total > 0 ? ` (${pct}%)` : ""}
                        {" · "}Đang làm {r.doing}
                        {r.overdue > 0 ? (
                          <span className="font-semibold text-red-600">
                            {" · "}
                            {r.overdue} việc quá hạn
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-black/10"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Tiến độ của ${r.name}`}
                    >
                      <div
                        className="h-full rounded-full bg-black"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
              {unassignedCount > 0 ? (
                <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/10 p-3 text-sm">
                  <span className="font-medium">Chưa giao ai</span>
                  <span className="text-black/60">
                    {unassignedCount} việc chưa giao
                  </span>
                </li>
              ) : null}
            </ul>
          )}
        </section>
      ) : null}
    </NoiboShell>
  );
}
