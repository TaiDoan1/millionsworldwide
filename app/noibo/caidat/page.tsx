import type { Metadata } from "next";
import Link from "next/link";
import {
  getNoiboSessionStaffAction,
  getNoiboSettings,
  listNoiboStaff,
} from "../../actions/noibo";
import { NoiboHeader, NoiboNotice, NoiboSectionTitle, NoiboShell } from "../shell";
import { NoiboNav } from "../nav";
import NoiboLoginForm from "../NoiboLoginForm";
import {
  AddStaffForm,
  SettingsForm,
  StaffRow,
} from "./settings-client";

export const metadata: Metadata = {
  title: "Cài đặt nội bộ — Millions",
  robots: { index: false, follow: false },
};

export default async function NoiboSettingsPage() {
  const me = await getNoiboSessionStaffAction();

  // Founder-only from the start: the founder account is seeded (see
  // backend/storage/noibo.ts), so there is no open setup form here.
  if (!me) {
    let dbError: string | null = null;
    try {
      await getNoiboSettings();
    } catch (error) {
      dbError = error instanceof Error ? error.message : "Có lỗi xảy ra.";
    }
    return (
      <NoiboShell>
        {dbError ? (
          <NoiboNotice message={dbError} />
        ) : (
          <>
            <p className="mb-6 rounded-lg border border-black/10 bg-black/[0.03] p-4 text-sm">
              Trang này chỉ dành cho founder. Đăng nhập để tiếp tục.
            </p>
            <NoiboLoginForm />
          </>
        )}
      </NoiboShell>
    );
  }
  if (me.role !== "founder") {
    return (
      <NoiboShell>
        <NoiboHeader me={me} />
        <NoiboNav isFounder={false} />
        <NoiboNotice message="Chỉ founder mới vào được trang Cài đặt." />
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
      <NoiboHeader me={me} />
      <NoiboNav isFounder />

      <h1 className="mb-3 text-base font-bold">Cài đặt nội bộ</h1>

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
