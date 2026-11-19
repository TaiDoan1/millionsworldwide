"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createStaff,
  deleteStaff,
  resetStaffPassword,
  saveNoiboSettings,
  setStaffActive,
  type NoiboSettings,
  type NoiboStaff,
} from "../../actions/noibo";

function FormMessage({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>
      {msg.text}
    </p>
  );
}

/** Add a staff account (username + display name + role + password). */
export function AddStaffForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"founder" | "staff">("staff");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const result = await createStaff({ username, name, role, password });
    setBusy(false);
    if (!result.success) {
      setMsg({ ok: false, text: result.error ?? "Thêm nhân viên không được." });
      return;
    }
    setUsername("");
    setName("");
    setPassword("");
    setMsg({ ok: true, text: "Đã thêm nhân viên." });
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-lg border border-black/10 bg-black/[0.03] p-4"
    >
      <p className="mb-3 text-sm font-semibold">Thêm nhân viên</p>
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tên đăng nhập"
            autoComplete="off"
            className="flex-1 rounded-lg border border-black/20 p-2.5 text-sm"
            required
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên hiển thị"
            className="flex-1 rounded-lg border border-black/20 p-2.5 text-sm"
            required
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "founder" | "staff")}
            className="rounded-lg border border-black/20 p-2.5 text-sm"
          >
            <option value="staff">Nhân viên</option>
            <option value="founder">Founder</option>
          </select>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu (từ 6 ký tự)"
            autoComplete="new-password"
            className="flex-1 rounded-lg border border-black/20 p-2.5 text-sm"
            required
          />
        </div>
        <FormMessage msg={msg} />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Đang thêm…" : "Thêm nhân viên"}
        </button>
      </div>
    </form>
  );
}

/** One staff row: lock/unlock + reset password. */
export function StaffRow({
  staff,
  isMe,
}: {
  staff: NoiboStaff;
  isMe: boolean;
}) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [armedDelete, setArmedDelete] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggleActive() {
    setMsg(null);
    setBusy(true);
    const result = await setStaffActive(staff.id, !staff.active);
    setBusy(false);
    if (!result.success) {
      setMsg({ ok: false, text: result.error ?? "Đổi trạng thái không được." });
      return;
    }
    router.refresh();
  }

  async function resetPassword() {
    setMsg(null);
    setBusy(true);
    const result = await resetStaffPassword(staff.id, newPassword);
    setBusy(false);
    if (!result.success) {
      setMsg({ ok: false, text: result.error ?? "Đặt lại mật khẩu không được." });
      return;
    }
    setNewPassword("");
    setShowReset(false);
    setMsg({ ok: true, text: "Đã đặt lại mật khẩu." });
    router.refresh();
  }

  async function deleteStaffRow() {
    if (!armedDelete) {
      setArmedDelete(true);
      return;
    }
    setMsg(null);
    setBusy(true);
    const result = await deleteStaff(staff.id);
    setBusy(false);
    setArmedDelete(false);
    if (!result.success) {
      setMsg({ ok: false, text: result.error ?? "Xóa nhân viên không được." });
      return;
    }
    router.refresh();
  }

  return (
    <li className="rounded-lg border border-black/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">
          <span className="font-medium">{staff.name}</span>{" "}
          <span className="text-black/50">@{staff.username}</span>{" "}
          <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs">
            {staff.role === "founder" ? "Founder" : "Nhân viên"}
          </span>{" "}
          {isMe ? (
            <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
              Bạn
            </span>
          ) : null}{" "}
          {!staff.active ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
              Đã khóa
            </span>
          ) : null}
        </p>
        <span className="flex items-center gap-2">
          <button
            onClick={() => setShowReset((v) => !v)}
            className="rounded-lg border border-black/20 px-2.5 py-1 text-xs"
          >
            Đặt lại mật khẩu
          </button>
          <button
            onClick={toggleActive}
            disabled={busy}
            className="rounded-lg border border-black/20 px-2.5 py-1 text-xs disabled:opacity-50"
          >
            {staff.active ? "Khóa" : "Mở khóa"}
          </button>
          {isMe ? null : (
            <button
              onClick={deleteStaffRow}
              disabled={busy}
              className={`rounded-lg border px-2.5 py-1 text-xs disabled:opacity-50 ${
                armedDelete
                  ? "border-red-600 font-semibold text-red-600"
                  : "border-black/20 text-red-600"
              }`}
            >
              {armedDelete ? "Chắc xóa?" : "Xóa"}
            </button>
          )}
        </span>
      </div>
      {showReset ? (
        <div className="mt-3 flex gap-2">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mật khẩu mới (từ 6 ký tự)"
            autoComplete="new-password"
            className="flex-1 rounded-lg border border-black/20 p-2.5 text-sm"
          />
          <button
            onClick={resetPassword}
            disabled={busy || newPassword.length < 6}
            className="rounded-lg bg-black px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Lưu mật khẩu
          </button>
        </div>
      ) : null}
      <FormMessage msg={msg} />
    </li>
  );
}

/** Announcement + shift-label templates, one save button. */
export function SettingsForm({ settings }: { settings: NoiboSettings }) {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState(settings.announcement ?? "");
  const [templates, setTemplates] = useState<string[]>(
    settings.shiftTemplates ?? []
  );
  const [newTemplate, setNewTemplate] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const result = await saveNoiboSettings({ announcement, shiftTemplates: templates });
    setBusy(false);
    if (!result.success) {
      setMsg({ ok: false, text: result.error ?? "Lưu cài đặt không được." });
      return;
    }
    setMsg({ ok: true, text: "Đã lưu cài đặt." });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Thông báo chung (hiện trên đầu trang /noibo)
        </span>
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          rows={3}
          placeholder="VD: Tuần này kiểm kho thứ 7, mọi người đi đủ ca nhé."
          className="w-full rounded-lg border border-black/20 p-2.5 text-sm"
        />
      </label>
      <div>
        <span className="mb-1 block text-sm font-medium">
          Mẫu ca làm (gợi ý khi xếp lịch)
        </span>
        <ul className="mb-2 space-y-1">
          {templates.map((t, i) => (
            <li
              key={`${t}-${i}`}
              className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2 text-sm"
            >
              <span>{t}</span>
              <button
                type="button"
                onClick={() => setTemplates(templates.filter((_, j) => j !== i))}
                className="text-black/40"
                aria-label={`Xóa mẫu ${t}`}
              >
                ×
              </button>
            </li>
          ))}
          {templates.length === 0 ? (
            <li className="text-sm text-black/40">Chưa có mẫu ca nào.</li>
          ) : null}
        </ul>
        <div className="flex gap-2">
          <input
            value={newTemplate}
            onChange={(e) => setNewTemplate(e.target.value)}
            placeholder="VD: Sáng 8h–12h"
            className="flex-1 rounded-lg border border-black/20 p-2.5 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              const clean = newTemplate.trim();
              if (clean && !templates.includes(clean)) {
                setTemplates([...templates, clean]);
              }
              setNewTemplate("");
            }}
            className="rounded-lg border border-black/20 px-3 py-2.5 text-sm"
          >
            Thêm mẫu
          </button>
        </div>
      </div>
      <FormMessage msg={msg} />
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Đang lưu…" : "Lưu cài đặt"}
      </button>
    </form>
  );
}
