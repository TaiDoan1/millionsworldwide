"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createShift,
  createTask,
  deleteShift,
  deleteTask,
  logoutStaff,
  saveDailyLog,
  updateTaskStatus,
  type NoiboStaff,
  type NoiboTask,
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

/** Founder: giao việc cho bất kỳ ai. Nhân viên: tự tạo việc cho chính mình. */
export function AddTaskForm({
  staff,
  me,
}: {
  staff: NoiboStaff[];
  me: NoiboStaff;
}) {
  const router = useRouter();
  const isFounder = me.role === "founder";
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState(isFounder ? "" : String(me.id));
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
    setAssigneeId(isFounder ? "" : String(me.id));
    setDueDate("");
    setNote("");
    setMsg({ ok: true, text: isFounder ? "Đã giao việc." : "Đã tạo việc." });
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-lg border border-black/10 bg-black/[0.03] p-4"
    >
      <p className="mb-3 text-sm font-semibold">
        {isFounder ? "Giao việc mới" : "Tạo việc mới"}
      </p>
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
            {isFounder ? (
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
            ) : (
              <p className="rounded-lg border border-black/20 bg-black/[0.03] p-2.5 text-sm">
                {me.name} (bạn)
              </p>
            )}
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
          {busy ? "Đang lưu…" : isFounder ? "Giao việc" : "Tạo việc"}
        </button>
      </div>
    </form>
  );
}

/** Founder: xếp ca cho bất kỳ ai. Nhân viên: tự đăng ký ca cho chính mình. */
export function AddShiftForm({
  staff,
  dates,
  templates,
  me,
}: {
  staff: NoiboStaff[];
  dates: string[];
  templates: string[];
  me: NoiboStaff;
}) {
  const router = useRouter();
  const isFounder = me.role === "founder";
  const [date, setDate] = useState(dates[0] ?? "");
  const [staffId, setStaffId] = useState(isFounder ? "" : String(me.id));
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
    setMsg({ ok: true, text: isFounder ? "Đã xếp ca." : "Đã đăng ký ca." });
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-lg border border-black/10 bg-black/[0.03] p-4"
    >
      <p className="mb-3 text-sm font-semibold">
        {isFounder ? "Xếp ca làm" : "Đăng ký ca làm"}
      </p>
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
          {isFounder ? (
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
          ) : (
            <p className="rounded-lg border border-black/20 bg-black/[0.03] p-2.5 text-sm">
              {me.name} (bạn)
            </p>
          )}
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
          {busy
            ? "Đang lưu…"
            : isFounder
              ? "Xếp ca"
              : "Đăng ký ca"}
        </button>
      </div>
    </form>
  );
}

const BOARD_LABEL: Record<NoiboTaskStatus, string> = {
  todo: "Chưa làm",
  doing: "Đang làm",
  done: "Đã xong",
};

const BOARD_ORDER: NoiboTaskStatus[] = ["todo", "doing", "done"];

/**
 * Trello-style board: three columns, drag a card between them to
 * change its status. The status pills stay as the touch fallback —
 * HTML5 drag-and-drop does not work on touch screens.
 */
export function TaskBoard({
  tasks,
  meId,
  isFounder,
  today,
}: {
  tasks: NoiboTask[];
  meId: number;
  isFounder: boolean;
  today: string;
}) {
  const router = useRouter();
  const [dragId, setDragId] = useState<number | null>(null);
  const [overStatus, setOverStatus] = useState<NoiboTaskStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function dropOn(status: NoiboTaskStatus) {
    const id = dragId;
    setDragId(null);
    setOverStatus(null);
    if (id === null || busy) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    setError(null);
    setBusy(true);
    const result = await updateTaskStatus(id, status);
    setBusy(false);
    if (!result.success) {
      setError(result.error ?? "Đổi trạng thái không được.");
      return;
    }
    router.refresh();
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-black/40">Chưa có công việc nào.</p>;
  }

  return (
    <div>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {BOARD_ORDER.map((status) => {
          const group = tasks.filter((t) => t.status === status);
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                if (overStatus !== status) setOverStatus(status);
              }}
              onDrop={(e) => {
                e.preventDefault();
                void dropOn(status);
              }}
              className={`min-h-32 rounded-lg border p-3 ${
                overStatus === status
                  ? "border-black bg-black/[0.05]"
                  : "border-black/10 bg-black/[0.02]"
              }`}
            >
              <h3 className="mb-3 text-sm font-semibold text-black/60">
                {BOARD_LABEL[status]} ({group.length})
              </h3>
              <ul className="space-y-2">
                {group.map((t) => {
                  const overdue =
                    status !== "done" &&
                    t.dueDate !== null &&
                    t.dueDate < today;
                  const canChange = isFounder || t.assigneeId === meId;
                  return (
                    <li
                      key={t.id}
                      draggable={canChange && !busy}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(t.id));
                        e.dataTransfer.effectAllowed = "move";
                        setDragId(t.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverStatus(null);
                      }}
                      className={`rounded-lg border border-black/10 bg-white p-3 ${
                        dragId === t.id ? "opacity-40" : ""
                      } ${
                        canChange
                          ? "cursor-grab active:cursor-grabbing"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${
                            status === "done"
                              ? "line-through text-black/50"
                              : ""
                          }`}
                        >
                          {t.title}
                        </p>
                        {isFounder || t.assigneeId === meId ? (
                          <DeleteButton
                            kind="task"
                            id={t.id}
                            label="Xóa công việc"
                          />
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-black/60">
                        {t.assigneeName
                          ? `Giao cho ${t.assigneeName}`
                          : "Chưa giao ai"}
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
              {group.length === 0 ? (
                <p className="text-xs text-black/40">Kéo task vào đây.</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** One day's work log, as the dashboard consumes it. */
export type DailyLogView = {
  date: string;
  staffId: number;
  staffName?: string;
  content: string;
};

/**
 * My daily work log: pick a day of the current week, write what I did.
 * Staff see only their own logs; founders see everyone's in the list below.
 */
export function DailyLogForm({
  dates,
  myLogs,
  today,
}: {
  dates: string[];
  myLogs: DailyLogView[];
  today: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(today);
  const [content, setContent] = useState(
    myLogs.find((l) => l.date === today)?.content ?? ""
  );
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function pickDate(next: string) {
    setDate(next);
    setContent(myLogs.find((l) => l.date === next)?.content ?? "");
    setMsg(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const result = await saveDailyLog({ date, content });
    setBusy(false);
    if (!result.success) {
      setMsg({ ok: false, text: result.error ?? "Lưu không được." });
      return;
    }
    setMsg({ ok: true, text: "Đã lưu công việc ngày." });
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-4 rounded-lg border border-black/10 bg-black/[0.03] p-4"
    >
      <p className="mb-3 text-sm font-semibold">Viết tóm tắt ngày</p>
      <label className="mb-2 block">
        <span className="mb-1 block text-xs text-black/60">Ngày</span>
        <select
          value={date}
          onChange={(e) => pickDate(e.target.value)}
          className="rounded-lg border border-black/20 p-2.5 text-sm"
        >
          {dates.map((d) => (
            <option key={d} value={d}>
              {dayLabel(d)}
              {d === today ? " (hôm nay)" : ""}
            </option>
          ))}
        </select>
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="Hôm nay làm được gì, còn vướng gì, mai làm gì…"
        className="w-full rounded-lg border border-black/20 p-2.5 text-sm"
        required
      />
      <FormMessage msg={msg} />
      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Đang lưu…" : "Lưu công việc"}
      </button>
    </form>
  );
}
