import type { Metadata } from "next";
import {
  getNoiboSessionStaffAction,
  getNoiboSettings,
  listNoiboStaff,
  listNoiboTasks,
} from "../../actions/noibo";
import { NoiboHeader, NoiboNotice, NoiboSectionTitle, NoiboShell } from "../shell";
import { NoiboNav } from "../nav";
import NoiboLoginForm from "../NoiboLoginForm";
import { AddTaskForm, TaskBoard } from "../dashboard-client";
import { vnToday } from "../week";

export const metadata: Metadata = {
  title: "Công việc — Nội bộ",
  robots: { index: false, follow: false },
};

/** /noibo/viec — tasks: create form + Trello board. */
export default async function NoiboViecPage() {
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

  let tasks;
  let staffList;
  try {
    [tasks, staffList] = await Promise.all([
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

  return (
    <NoiboShell>
      <NoiboHeader me={me} />
      <NoiboNav isFounder={isFounder} />

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
