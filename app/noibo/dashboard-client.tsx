"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createShift,
  createTask,
  deleteShift,
  deleteTask,
  logoutStaff,
  updateTaskStatus,
  type NoiboStaff,
  type NoiboTaskStatus,
} from "../actions/noibo";
import { dayLabel } from "./week";

/** Small inline feedback line used by the forms below. */
function FormMessage({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>
      {msg.text}
    </p>
  );
}

export function LogoutButton() {
  const router = useRouter();
  async function onClick() {
    await logoutStaff();
    router.refresh();
  }
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-black/20 px-3 py-1.5 text-sm"
    >
      Đăng xuất
    </button>
  );
}

const STATUS_LABEL: Record<NoiboTaskStatus, string> = {
  todo: "Chưa làm",
  doing: "Đang làm",
  done: "Xong",
};

const STATUS_ORDER: NoiboTaskStatus[] = ["todo", "doing", "done"];

/** Status pills for one task. Staff only see this for their own tasks. */
export function TaskStatusButtons({
  taskId,
  status,
}: {
  taskId: number;
  status: NoiboTaskStatus;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function change(next: NoiboTaskStatus) {
    if (next === status || busy) return;
    setError(null);
    setBusy(true);
    const result = await updateTaskStatus(taskId, next);
    setBusy(false);
    if (!result.success) {
      setError(result.error ?? "Đổi trạng thái không được.");
      return;
    }
    router.refresh();
  }

  return (
    <span>
      <span className="inline-flex gap-1">
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => change(s)}
            disabled={busy || s === status}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              s === status
                ? s === "done"
                  ? "bg-green-600 text-white"
                  : s === "doing"
                    ? "bg-amber-500 text-white"
                    : "bg-black text-white"
                : "border border-black/20 text-black/70"
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </span>
      {error ? <span className="ml-2 text-xs text-red-600">{error}</span> : null}
    </span>
  );
}

/** Two-click delete: first click arms it, second click confirms. */
export function DeleteButton({
  kind,
  id,
  label,
}: {
  kind: "task" | "shift";
  id: number;
  label: string;
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!armed) {
      setArmed(true);
      return;
    }
    const result =
      kind === "task" ? await deleteTask(id) : await deleteShift(id);
    if (!result.success) {
      setError(result.error ?? "Xóa không được.");
      setArmed(false);
      return;
    }
    router.refresh();
  }

  return (
    <span>
      <button
        onClick={onClick}
        className={`text-xs ${armed ? "font-semibold text-red-600" : "text-black/40"}`}
        aria-label={label}
      >
        {armed ? "Chắc xóa?" : "×"}
      </button>
      {error ? <span className="ml-2 text-xs text-red-600">{error}</span> : null}
    </span>
  );
}

/** Admin-only: assign a new task. */
export function AddTaskForm({ staff }: { staff: NoiboStaff[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const result = await createTask({
      title,
      assigneeId: assigneeId === "" ? null : Number(assigneeId),
      dueDate: dueDate === "" ? null : dueDate,
      note,
    });
    setBusy(false);
    if (!result.success) {
      setMsg({ ok: false, text: result.error ?? "Giao việc không được." });
      return;
    }
    setTitle("");
    setAssigneeId("");
    setDueDate("");
    setNote("");
    setMsg({ ok: true, text: "Đã giao việc." });
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-lg border border-black/10 bg-black/[0.03] p-4"
    >
      <p className="mb-3 text-sm font-semibold">Giao việc mới</p>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Việc gì? VD: Kiểm kho cuối tuần"
          className="w-full rounded-lg border border-black/20 p-2.5 text-sm"
          required
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1">
            <span className="mb-1 block text-xs text-black/60">Giao cho</span>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-lg border border-black/20 p-2.5 text-sm"
            >
              <option value="">Chưa giao ai</option>
              {staff
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs text-black/60">Hạn xong</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-black/20 p-2.5 text-sm"
            />
          </label>
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú (không bắt buộc)"
          className="w-full rounded-lg border border-black/20 p-2.5 text-sm"
        />
        <FormMessage msg={msg} />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Đang giao…" : "Giao việc"}
        </button>
      </div>
    </form>
  );
}

/** Admin-only: put a staff member on a shift for one day of the week. */
export function AddShiftForm({
  staff,
  dates,
  templates,
}: {
  staff: NoiboStaff[];
  dates: string[];
  templates: string[];
}) {
  const router = useRouter();
  const [date, setDate] = useState(dates[0] ?? "");
  const [staffId, setStaffId] = useState("");
  const [label, setLabel] = useState(templates[0] ?? "");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const result = await createShift({
      date,
      staffId: Number(staffId),
      label,
      note,
    });
    setBusy(false);
    if (!result.success) {
      setMsg({ ok: false, text: result.error ?? "Xếp ca không được." });
      return;
    }
    setNote("");
    setMsg({ ok: true, text: "Đã xếp ca." });
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-lg border border-black/10 bg-black/[0.03] p-4"
    >
      <p className="mb-3 text-sm font-semibold">Xếp ca làm</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label>
          <span className="mb-1 block text-xs text-black/60">Ngày</span>
          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-black/20 p-2.5 text-sm"
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {dayLabel(d)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-xs text-black/60">Nhân viên</span>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full rounded-lg border border-black/20 p-2.5 text-sm"
            required
          >
            <option value="">Chọn nhân viên</option>
            {staff
              .filter((s) => s.active)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-xs text-black/60">Ca làm</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            list="noibo-shift-templates"
            placeholder="VD: Sáng 8h–12h"
            className="w-full rounded-lg border border-black/20 p-2.5 text-sm"
            required
          />
          <datalist id="noibo-shift-templates">
            {templates.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-xs text-black/60">Ghi chú</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Không bắt buộc"
            className="w-full rounded-lg border border-black/20 p-2.5 text-sm"
          />
        </label>
      </div>
      <div className="mt-3">
        <FormMessage msg={msg} />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Đang xếp…" : "Xếp ca"}
        </button>
      </div>
    </form>
  );
}
