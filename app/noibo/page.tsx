import type { Metadata } from "next";
import Link from "next/link";
import {
  getMyCheckinToday,
  getNoiboSessionStaffAction,
  getNoiboSettings,
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
  try {
    [settings, myCheckin, tasks] = await Promise.all([
      getNoiboSettings(),
      getMyCheckinToday(),
      listNoiboTasks(),
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
    </NoiboShell>
  );
}
