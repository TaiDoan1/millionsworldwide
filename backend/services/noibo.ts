/**
 * Backend service: internal staff pages (/noibo).
 *
 * Called only via app/actions/noibo.ts. Every mutation checks the
 * staff session itself (backend/auth/noibo-auth.ts): a missing or
 * non-founder session can never write, even if a page forgets its gate.
 *
 * Passwords are scrypt hashes (node:crypto, no new dependency).
 * Sessions are random tokens whose SHA-256 lives in noibo_sessions;
 * the raw token lives only in the httpOnly /noibo cookie.
 *
 * Mutations return { success, error? } like the settings service.
 * Reads throw a friendly Error when Postgres is missing or down, so
 * the pages can show a notice instead of a 500.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { checkRateLimit, clientKey } from "../security/rate-limit";
// Pure date helpers shared with the /noibo pages (no UI imports).
import { addDays, vnDayStartIso, vnToday } from "../../app/noibo/week";
import {
  NOIBO_SESSION_DAYS,
  clearNoiboSessionCookie,
  getNoiboSessionStaff,
  hashSessionToken,
  readNoiboSessionToken,
  setNoiboSessionCookie,
} from "../auth/noibo-auth";
import * as store from "../storage/noibo";
import {
  cleanUsername,
  isValidDateString,
  validateAnnouncement,
  validateDailyLogContent,
  validatePassword,
  validateShiftLabel,
  validateShiftNote,
  validateShiftTemplates,
  validateStaffName,
  validateTaskNote,
  validateTaskTitle,
  validateUsername,
} from "./noibo-validation";
import type {
  NoiboCheckin,
  NoiboDailyLog,
  NoiboSettings,
  NoiboShift,
  NoiboStaff,
  NoiboTask,
  NoiboTaskStatus,
} from "../storage/types";

export type {
  NoiboCheckin,
  NoiboDailyLog,
  NoiboRole,
  NoiboSettings,
  NoiboShift,
  NoiboStaff,
  NoiboTask,
  NoiboTaskStatus,
} from "../storage/types";

const NO_POSTGRES_MESSAGE =
  "Trang nội bộ cần kết nối Postgres (DATABASE_URL) mới dùng được.";

export const DEFAULT_SHIFT_TEMPLATES = [
  "Sáng 8h–12h",
  "Chiều 13h–17h",
  "Tối 18h–22h",
];

function isPostgresMissing(error: unknown): boolean {
  return (
    error instanceof Error && /Postgres is not configured/.test(error.message)
  );
}

function dbErrorMessage(error: unknown): string {
  if (isPostgresMissing(error)) return NO_POSTGRES_MESSAGE;
  console.error("[noibo] Database error:", error);
  return "Có lỗi xảy ra, thử lại nhé.";
}

/** Password hashing: scrypt with a random 16-byte salt. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  try {
    const hash = scryptSync(password, parts[1], 64);
    const expected = Buffer.from(parts[2], "hex");
    return hash.length === expected.length && timingSafeEqual(hash, expected);
  } catch {
    return false;
  }
}

type Result = { success: boolean; error?: string };

async function requireFounder(): Promise<NoiboStaff | null> {
  const me = await getNoiboSessionStaff();
  return me && me.role === "founder" ? me : null;
}

async function createSessionFor(staffId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + NOIBO_SESSION_DAYS * 24 * 60 * 60 * 1000
  );
  await store.createSession({
    tokenHash: hashSessionToken(token),
    staffId,
    expiresAt: expiresAt.toISOString(),
  });
  await setNoiboSessionCookie(token, expiresAt);
}

/** Staff login. Wrong credentials and unknown users get the same text. */
export async function loginStaff(
  username: string,
  password: string
): Promise<Result> {
  const cleanName = cleanUsername(username);
  const key = `${await clientKey("noibo-login")}:${cleanName}`;
  if (!checkRateLimit(key, 10, 15 * 60 * 1000)) {
    return {
      success: false,
      error: "Đăng nhập sai quá nhiều lần. Thử lại sau 15 phút.",
    };
  }
  try {
    const staff = await store.getStaffAuthByUsername(cleanName);
    if (
      !staff ||
      !staff.active ||
      !verifyPassword(password, staff.passwordHash)
    ) {
      return { success: false, error: "Sai tên đăng nhập hoặc mật khẩu." };
    }
    await createSessionFor(staff.id);
    revalidatePath("/noibo");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

export async function logoutStaff(): Promise<Result> {
  try {
    const token = await readNoiboSessionToken();
    if (token) {
      await store
        .deleteSession(hashSessionToken(token))
        .catch(() => undefined);
    }
  } catch {
    // A missing database must not block clearing the cookie below.
  }
  await clearNoiboSessionCookie();
  revalidatePath("/noibo");
  return { success: true };
}

/** Check in for the current staff member. One open session at a time. */
export async function checkIn(): Promise<Result> {
  const me = await getNoiboSessionStaff();
  if (!me) return { success: false, error: "Cần đăng nhập lại." };
  try {
    const open = await store.getOpenCheckin(me.id);
    if (open) {
      return {
        success: false,
        error: "Bạn đang trong ca làm rồi, check-out trước đã.",
      };
    }
    await store.insertCheckin(me.id, new Date().toISOString());
    revalidatePath("/noibo");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/** Check out, closing the open session. */
export async function checkOut(): Promise<Result> {
  const me = await getNoiboSessionStaff();
  if (!me) return { success: false, error: "Cần đăng nhập lại." };
  try {
    const open = await store.getOpenCheckin(me.id);
    if (!open) {
      return { success: false, error: "Bạn chưa check-in." };
    }
    await store.closeCheckin(open.id, new Date().toISOString());
    revalidatePath("/noibo");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/** Founder-only: add a staff account. */
export async function createStaff(input: {
  username: string;
  name: string;
  role: "founder" | "staff";
  password: string;
}): Promise<Result> {
  const me = await requireFounder();
  if (!me) {
    return {
      success: false,
      error: "Chỉ founder mới thêm được nhân viên.",
    };
  }
  const username = cleanUsername(input.username);
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const badUsername = validateUsername(username);
  if (badUsername) return { success: false, error: badUsername };
  const badName = validateStaffName(name);
  if (badName) return { success: false, error: badName };
  if (input.role !== "founder" && input.role !== "staff") {
    return { success: false, error: "Vai trò không hợp lệ." };
  }
  const badPassword = validatePassword(input.password);
  if (badPassword) return { success: false, error: badPassword };
  try {
    const existing = await store.getStaffAuthByUsername(username);
    if (existing) {
      return { success: false, error: "Tên đăng nhập này đã có người dùng." };
    }
    await store.insertStaff({
      username,
      name,
      role: input.role,
      passwordHash: hashPassword(input.password),
    });
    revalidatePath("/noibo/caidat");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/** Founder-only: lock/unlock a staff account. */
export async function setStaffActive(
  id: number,
  active: boolean
): Promise<Result> {
  const me = await requireFounder();
  if (!me) {
    return {
      success: false,
      error: "Chỉ founder mới đổi được trạng thái nhân viên.",
    };
  }
  try {
    const target = await store.getStaffById(id);
    if (!target) return { success: false, error: "Không tìm thấy nhân viên." };
    if (target.id === me.id && !active) {
      return { success: false, error: "Không tự khóa tài khoản của mình được." };
    }
    if (target.role === "founder" && !active) {
      const founders = await store.countActiveFounders();
      if (founders <= 1) {
        return {
          success: false,
          error: "Phải còn ít nhất 1 founder đang hoạt động.",
        };
      }
    }
    await store.updateStaffActive(id, active);
    if (!active) await store.deleteSessionsForStaff(id);
    revalidatePath("/noibo/caidat");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/** Founder-only: set a new password; logs that staff out everywhere. */
export async function resetStaffPassword(
  id: number,
  newPassword: string
): Promise<Result> {
  const me = await requireFounder();
  if (!me) {
    return {
      success: false,
      error: "Chỉ founder mới đặt lại được mật khẩu.",
    };
  }
  const badPassword = validatePassword(newPassword);
  if (badPassword) return { success: false, error: badPassword };
  try {
    const target = await store.getStaffById(id);
    if (!target) return { success: false, error: "Không tìm thấy nhân viên." };
    await store.updateStaffPassword(id, hashPassword(newPassword));
    await store.deleteSessionsForStaff(id);
    revalidatePath("/noibo/caidat");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/** Founder-only: delete a staff account (tasks unassigned, shifts removed). */
export async function deleteStaff(id: number): Promise<Result> {
  const me = await requireFounder();
  if (!me) {
    return {
      success: false,
      error: "Chỉ founder mới xóa được nhân viên.",
    };
  }
  try {
    const target = await store.getStaffById(id);
    if (!target) return { success: false, error: "Không tìm thấy nhân viên." };
    if (target.id === me.id) {
      return {
        success: false,
        error: "Không tự xóa tài khoản của mình được.",
      };
    }
    if (target.role === "founder" && target.active) {
      const founders = await store.countActiveFounders();
      if (founders <= 1) {
        return {
          success: false,
          error: "Phải còn ít nhất 1 founder đang hoạt động.",
        };
      }
    }
    await store.deleteStaff(id);
    revalidatePath("/noibo/caidat");
    revalidatePath("/noibo");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/**
 * Create a task. Founders assign to anyone (or no one); staff create
 * tasks for themselves.
 */
export async function createTask(input: {
  title: string;
  assigneeId: number | null;
  dueDate: string | null;
  note: string | null;
}): Promise<Result> {
  const me = await getNoiboSessionStaff();
  if (!me) return { success: false, error: "Cần đăng nhập lại." };
  const assigneeId =
    me.role === "founder" ? input.assigneeId : me.id;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const badTitle = validateTaskTitle(title);
  if (badTitle) return { success: false, error: badTitle };
  const dueDate =
    typeof input.dueDate === "string" && input.dueDate.trim() !== ""
      ? input.dueDate.trim()
      : null;
  if (dueDate !== null && !isValidDateString(dueDate)) {
    return { success: false, error: "Hạn xong không đúng định dạng ngày." };
  }
  const note =
    typeof input.note === "string" && input.note.trim() !== ""
      ? input.note.trim()
      : null;
  const badNote = validateTaskNote(note);
  if (badNote) return { success: false, error: badNote };
  try {
    if (assigneeId !== null) {
      const assignee = await store.getStaffById(assigneeId);
      if (!assignee || !assignee.active) {
        return { success: false, error: "Người được giao việc không còn hoạt động." };
      }
    }
    await store.insertTask({
      title,
      assigneeId,
      dueDate,
      note,
      createdBy: me.id,
    });
    revalidatePath("/noibo");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/**
 * Change a task's status. Founders may change any task; staff may only
 * change tasks assigned to them.
 */
export async function updateTaskStatus(
  id: number,
  status: NoiboTaskStatus
): Promise<Result> {
  const me = await getNoiboSessionStaff();
  if (!me) return { success: false, error: "Cần đăng nhập lại." };
  if (status !== "todo" && status !== "doing" && status !== "done") {
    return { success: false, error: "Trạng thái không hợp lệ." };
  }
  try {
    const task = await store.getTaskById(id);
    if (!task) return { success: false, error: "Không tìm thấy công việc." };
    if (me.role !== "founder" && task.assigneeId !== me.id) {
      return {
        success: false,
        error: "Chỉ người được giao việc mới đổi được trạng thái.",
      };
    }
    await store.updateTaskStatus(id, status);
    revalidatePath("/noibo");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/**
 * Delete a task. Founders may delete any task; staff may delete their own.
 */
export async function deleteTask(id: number): Promise<Result> {
  const me = await getNoiboSessionStaff();
  if (!me) return { success: false, error: "Cần đăng nhập lại." };
  try {
    const task = await store.getTaskById(id);
    if (!task) return { success: false, error: "Không tìm thấy công việc." };
    if (me.role !== "founder" && task.assigneeId !== me.id) {
      return {
        success: false,
        error: "Bạn chỉ xóa được việc của chính mình.",
      };
    }
    const ok = await store.deleteTask(id);
    if (!ok) return { success: false, error: "Không tìm thấy công việc." };
    revalidatePath("/noibo");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/** Founder: xếp ca cho bất kỳ ai. Nhân viên: chỉ đăng ký ca cho chính mình. */
export async function createShift(input: {
  date: string;
  staffId: number;
  label: string;
  note: string | null;
}): Promise<Result> {
  const me = await getNoiboSessionStaff();
  if (!me) {
    return { success: false, error: "Cần đăng nhập lại." };
  }
  if (me.role !== "founder" && input.staffId !== me.id) {
    return {
      success: false,
      error: "Bạn chỉ đăng ký ca cho chính mình.",
    };
  }
  if (!isValidDateString(input.date)) {
    return { success: false, error: "Ngày làm không đúng định dạng." };
  }
  const label = typeof input.label === "string" ? input.label.trim() : "";
  const badLabel = validateShiftLabel(label);
  if (badLabel) return { success: false, error: badLabel };
  const note =
    typeof input.note === "string" && input.note.trim() !== ""
      ? input.note.trim()
      : null;
  const badNote = validateShiftNote(note);
  if (badNote) return { success: false, error: badNote };
  try {
    const staff = await store.getStaffById(input.staffId);
    if (!staff || !staff.active) {
      return { success: false, error: "Nhân viên này không còn hoạt động." };
    }
    await store.insertShift({ date: input.date, staffId: input.staffId, label, note });
    revalidatePath("/noibo");
    return { success: true };
  } catch (error) {
    const message = dbErrorMessage(error);
    if (/Ca này đã có rồi/.test(error instanceof Error ? error.message : "")) {
      return { success: false, error: "Ca này đã có rồi." };
    }
    return { success: false, error: message };
  }
}

/** Founder: xóa ca nào cũng được. Nhân viên: chỉ hủy ca của chính mình. */
export async function deleteShift(id: number): Promise<Result> {
  const me = await getNoiboSessionStaff();
  if (!me) {
    return { success: false, error: "Cần đăng nhập lại." };
  }
  try {
    if (me.role !== "founder") {
      const shift = await store.getShiftById(id);
      if (!shift) return { success: false, error: "Không tìm thấy ca làm." };
      if (shift.staffId !== me.id) {
        return {
          success: false,
          error: "Bạn chỉ hủy được ca của chính mình.",
        };
      }
    }
    const ok = await store.deleteShift(id);
    if (!ok) return { success: false, error: "Không tìm thấy ca làm." };
    revalidatePath("/noibo");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/** Founder-only: save the announcement + shift-label templates. */
export async function saveNoiboSettings(input: {
  announcement: string;
  shiftTemplates: string[];
}): Promise<Result> {
  const me = await requireFounder();
  if (!me) {
    return {
      success: false,
      error: "Chỉ founder mới đổi được cài đặt.",
    };
  }
  const announcement =
    typeof input.announcement === "string" ? input.announcement.trim() : "";
  const badAnnouncement = validateAnnouncement(announcement);
  if (badAnnouncement) return { success: false, error: badAnnouncement };
  const templates = input.shiftTemplates
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter((t) => t.length > 0);
  const badTemplates = validateShiftTemplates(templates);
  if (badTemplates) return { success: false, error: badTemplates };
  try {
    await store.writeNoiboSettings({ announcement, shiftTemplates: templates });
    revalidatePath("/noibo");
    revalidatePath("/noibo/caidat");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/** Reads for the pages. Throw a friendly error when the database is unavailable. */

export async function getNoiboSettings(): Promise<NoiboSettings> {
  try {
    const stored = await store.readNoiboSettings();
    return {
      announcement: stored?.announcement ?? "",
      shiftTemplates: stored?.shiftTemplates ?? DEFAULT_SHIFT_TEMPLATES,
    };
  } catch (error) {
    if (isPostgresMissing(error)) throw new Error(NO_POSTGRES_MESSAGE);
    throw error;
  }
}

export async function listNoiboStaff(): Promise<NoiboStaff[]> {
  const me = await requireFounder();
  if (!me) throw new Error("Chỉ founder mới xem được danh sách nhân viên.");
  try {
    return await store.listStaff();
  } catch (error) {
    if (isPostgresMissing(error)) throw new Error(NO_POSTGRES_MESSAGE);
    throw error;
  }
}

export async function listNoiboTasks(): Promise<NoiboTask[]> {
  const me = await getNoiboSessionStaff();
  if (!me) throw new Error("Cần đăng nhập lại.");
  try {
    return await store.listTasks();
  } catch (error) {
    if (isPostgresMissing(error)) throw new Error(NO_POSTGRES_MESSAGE);
    throw error;
  }
}

export async function listNoiboShifts(
  startDate: string,
  endDate: string
): Promise<NoiboShift[]> {
  const me = await getNoiboSessionStaff();
  if (!me) throw new Error("Cần đăng nhập lại.");
  try {
    return await store.listShiftsBetween(startDate, endDate);
  } catch (error) {
    if (isPostgresMissing(error)) throw new Error(NO_POSTGRES_MESSAGE);
    throw error;
  }
}

/** My open session (if any) + minutes I worked today (VN time). */
export async function getMyCheckinToday(): Promise<{
  open: NoiboCheckin | null;
  todayMinutes: number;
}> {
  const me = await getNoiboSessionStaff();
  if (!me) throw new Error("Cần đăng nhập lại.");
  try {
    const today = vnToday();
    const sessions = await store.listCheckinsBetween(
      vnDayStartIso(today),
      vnDayStartIso(addDays(today, 1)),
      me.id
    );
    const now = Date.now();
    let todayMinutes = 0;
    for (const s of sessions) {
      const end = s.checkOutAt ? new Date(s.checkOutAt).getTime() : now;
      todayMinutes += Math.max(
        0,
        (end - new Date(s.checkInAt).getTime()) / 60000
      );
    }
    return { open: await store.getOpenCheckin(me.id), todayMinutes };
  } catch (error) {
    if (isPostgresMissing(error)) throw new Error(NO_POSTGRES_MESSAGE);
    throw error;
  }
}

/** Founder-only: all check-in sessions in a VN date range. */
export async function listCheckinWeek(
  startDate: string,
  endDate: string
): Promise<NoiboCheckin[]> {
  const me = await requireFounder();
  if (!me) throw new Error("Chỉ founder mới xem được giờ làm của nhân viên.");
  try {
    return await store.listCheckinsBetween(
      vnDayStartIso(startDate),
      vnDayStartIso(addDays(endDate, 1))
    );
  } catch (error) {
    if (isPostgresMissing(error)) throw new Error(NO_POSTGRES_MESSAGE);
    throw error;
  }
}

/** Write (or rewrite) my work log for one day. */
export async function saveDailyLog(input: {
  date: string;
  content: string;
}): Promise<Result> {
  const me = await getNoiboSessionStaff();
  if (!me) return { success: false, error: "Cần đăng nhập lại." };
  if (!isValidDateString(input.date)) {
    return { success: false, error: "Ngày làm không đúng định dạng." };
  }
  const content =
    typeof input.content === "string" ? input.content.trim() : "";
  const badContent = validateDailyLogContent(content);
  if (badContent) return { success: false, error: badContent };
  try {
    await store.upsertDailyLog(me.id, input.date, content);
    revalidatePath("/noibo");
    return { success: true };
  } catch (error) {
    return { success: false, error: dbErrorMessage(error) };
  }
}

/** Work logs in a date range: mine for staff, everyone's for founders. */
export async function listDailyLogs(
  startDate: string,
  endDate: string
): Promise<NoiboDailyLog[]> {
  const me = await getNoiboSessionStaff();
  if (!me) throw new Error("Cần đăng nhập lại.");
  try {
    return await store.listDailyLogsBetween(
      startDate,
      endDate,
      me.role === "founder" ? undefined : me.id
    );
  } catch (error) {
    if (isPostgresMissing(error)) throw new Error(NO_POSTGRES_MESSAGE);
    throw error;
  }
}
