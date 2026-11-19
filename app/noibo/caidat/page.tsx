import type { Metadata } from "next";
import Link from "next/link";
import {
  getNoiboSessionStaffAction,
  getNoiboSettings,
  hasNoiboStaff,
  listNoiboStaff,
} from "../../actions/noibo";
import { NoiboNotice, NoiboSectionTitle, NoiboShell } from "../shell";
import NoiboLoginForm from "../NoiboLoginForm";
import {
  AddStaffForm,
  SettingsForm,
  SetupFirstAdminForm,
  StaffRow,
} from "./settings-client";

export const metadata: Metadata = {
  title: "Cài đặt nội bộ — Millions",
  robots: { index: false, follow: false },
};

export default async function NoiboSettingsPage() {
  const me = await getNoiboSessionStaffAction();

  // No accounts at all yet: the first-run setup creates the admin.
  let needsSetup = false;
  let dbError: string | null = null;
  try {
    needsSetup = !(await hasNoiboStaff());
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Có lỗi xảy ra.";
  }
  if (dbError) {
    return (
      <NoiboShell>
        <NoiboNotice message={dbError} />
      </NoiboShell>
    );
  }
  if (!me) {
    return (
      <NoiboShell>
        {needsSetup ? (
          <SetupFirstAdminForm />
        ) : (
          <>
            <p className="mb-6 rounded-lg border border-black/10 bg-black/[0.03] p-4 text-sm">
              Trang này chỉ dành cho tài khoản quản lý. Đăng nhập để tiếp tục.
            </p>
            <NoiboLoginForm needsSetup={false} />
          </>
        )}
      </NoiboShell>
    );
  }
  if (me.role !== "admin") {
    return (
      <NoiboShell>
        <NoiboNotice message="Chỉ tài khoản quản lý mới vào được trang Cài đặt." />
        <p className="mt-4 text-sm">
          <Link href="/noibo" className="underline">
            ← Quay lại trang nội bộ
          </Link>
        </p>
      </NoiboShell>
    );
  }

  let staffList;
  let settings;
  try {
    [staffList, settings] = await Promise.all([
      listNoiboStaff(),
      getNoiboSettings(),
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
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold">Cài đặt nội bộ</h1>
        <Link
          href="/noibo"
          className="rounded-lg border border-black/20 px-3 py-1.5 text-sm"
        >
          ← Trang nội bộ
        </Link>
      </div>

      <section className="mb-10">
        <NoiboSectionTitle>Nhân viên ({staffList.length})</NoiboSectionTitle>
        <AddStaffForm />
        <ul className="space-y-2">
          {staffList.map((s) => (
            <StaffRow key={s.id} staff={s} isMe={s.id === me.id} />
          ))}
        </ul>
      </section>

      <section>
        <NoiboSectionTitle>Cài đặt chung</NoiboSectionTitle>
        <SettingsForm settings={settings} />
      </section>
    </NoiboShell>
  );
}
