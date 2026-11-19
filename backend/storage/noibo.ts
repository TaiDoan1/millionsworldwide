/**
 * Postgres-backed storage for the internal staff pages (/noibo).
 *
 * Deliberately Postgres-only (no SQLite/file branch), like the product
 * catalog: staff accounts, tasks and schedules are live data of the
 * Postgres deployment. Without DATABASE_URL the service layer refuses
 * with a clear message instead of writing to a second store.
 *
 * Tables:
 * - noibo_staff: one login account per staff member. password_hash is a
 *   scrypt hash (see backend/services/noibo.ts) and is never selected
 *   into the public NoiboStaff type. The founder account ("taidoan")
 *   is seeded on first init (see SEEDED_FOUNDER_*) so /noibo/caidat
 *   is founder-login-only from the start — there is no open setup form.
 * - noibo_sessions: login sessions. Only the SHA-256 of the cookie
 *   token is stored; the raw token lives only in the httpOnly cookie.
 * - noibo_tasks: work items with an assignee, an optional deadline and
 *   a status (todo / doing / done).
 * - noibo_shifts: one row per person per shift label per day.
 * - noibo_settings: single row (id = 1) holding the announcement and
 *   the shift-label templates, edited in /noibo/caidat.
 */
import { getPostgresPool } from "./postgres";
import type {
  NoiboSettings,
  NoiboShift,
  NoiboStaff,
  NoiboTask,
} from "./types";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS noibo_staff (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS noibo_sessions (
    token_hash TEXT PRIMARY KEY,
    staff_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS noibo_tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    assignee_id INTEGER,
    due_date TEXT,
    status TEXT NOT NULL,
    note TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS noibo_shifts (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    staff_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    note TEXT,
    UNIQUE (date, staff_id, label)
  );
  CREATE TABLE IF NOT EXISTS noibo_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data JSONB NOT NULL
  );
`;

let initPromise: Promise<void> | null = null;

/**
 * The founder account, seeded when the staff table is first created
 * empty. Only the scrypt hash is stored here — never the password
 * itself. The founder should change this password after the first
 * login (/noibo/caidat → Đặt lại mật khẩu on their own row).
 */
const SEEDED_FOUNDER_USERNAME = "taidoan";
const SEEDED_FOUNDER_NAME = "Đoàn Anh Tài";
const SEEDED_FOUNDER_PASSWORD_HASH =
  "scrypt$6ebff5f247e15f00aba85bd92e89a1c6$5a78fb37f606441ed64a587216dd2d45bc3114a834857f5f490a90ca566ac201eee5b4d0abbc1bf5a65ebcbfb27663e9b834d4adf195ab6ec0d0f7334d3722ff";

/**
 * One-time migration for accounts created by the first /noibo build,
 * where the manager role was called "admin": those rows become
 * "founder" so nobody is locked out of /noibo/caidat by the rename.
 * Idempotent — a no-op once no "admin" rows remain. Exported for the
 * pg-mem test (the full init chain cannot run twice on one pg-mem db).
 */
export async function migrateLegacyAdmins(): Promise<void> {
  await getPostgresPool().query(
    "UPDATE noibo_staff SET role = 'founder' WHERE role = 'admin'"
  );
}

async function seedFounderIfEmpty(): Promise<void> {
  const pool = getPostgresPool();
  const count = await pool.query<{ c: string }>(
    "SELECT COUNT(*) AS c FROM noibo_staff"
  );
  if (Number(count.rows[0]?.c ?? 0) > 0) return;
  await pool.query(
    `INSERT INTO noibo_staff (username, name, role, password_hash, active, created_at)
     VALUES ($1, $2, 'founder', $3, true, $4)
     ON CONFLICT (username) DO NOTHING`,
    [
      SEEDED_FOUNDER_USERNAME,
      SEEDED_FOUNDER_NAME,
      SEEDED_FOUNDER_PASSWORD_HASH,
      new Date().toISOString(),
    ]
  );
}

/** Create the tables once per process. Loud on failure. */
export function ensureNoiboInit(): Promise<void> {
  if (!initPromise) {
    initPromise = getPostgresPool()
      .query(SCHEMA)
      .then(() => migrateLegacyAdmins())
      .then(() => seedFounderIfEmpty())
      .catch((error) => {
        console.error("[storage] Noibo init failed:", error);
        throw error;
      });
  }
  return initPromise;
}

type StaffRow = {
  id: number;
  username: string;
  name: string;
  role: string;
  active: boolean;
  created_at: string;
};

function staffFromRow(r: StaffRow): NoiboStaff {
  return {
    id: r.id,
    username: r.username,
    name: r.name,
    role: r.role === "founder" ? "founder" : "staff",
    active: r.active,
    createdAt: r.created_at,
  };
}

const STAFF_COLUMNS = "id, username, name, role, active, created_at";

export async function listStaff(): Promise<NoiboStaff[]> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<StaffRow>(
    `SELECT ${STAFF_COLUMNS} FROM noibo_staff ORDER BY name`
  );
  return result.rows.map(staffFromRow);
}

export async function getStaffById(id: number): Promise<NoiboStaff | null> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<StaffRow>(
    `SELECT ${STAFF_COLUMNS} FROM noibo_staff WHERE id = $1`,
    [id]
  );
  const row = result.rows[0];
  return row ? staffFromRow(row) : null;
}

/** The login lookup: returns the row WITH the password hash. */
export async function getStaffAuthByUsername(
  username: string
): Promise<(NoiboStaff & { passwordHash: string }) | null> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<StaffRow & { password_hash: string }>(
    `SELECT ${STAFF_COLUMNS}, password_hash FROM noibo_staff WHERE username = $1`,
    [username]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { ...staffFromRow(row), passwordHash: row.password_hash };
}

export async function countStaff(): Promise<number> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<{ c: string }>(
    "SELECT COUNT(*) AS c FROM noibo_staff"
  );
  return Number(result.rows[0]?.c ?? 0);
}

export async function countActiveFounders(): Promise<number> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<{ c: string }>(
    "SELECT COUNT(*) AS c FROM noibo_staff WHERE role = 'founder' AND active = true"
  );
  return Number(result.rows[0]?.c ?? 0);
}

export async function insertStaff(input: {
  username: string;
  name: string;
  role: "founder" | "staff";
  passwordHash: string;
}): Promise<NoiboStaff> {
  await ensureNoiboInit();
  const now = new Date().toISOString();
  const result = await getPostgresPool().query<StaffRow>(
    `INSERT INTO noibo_staff (username, name, role, password_hash, active, created_at)
     VALUES ($1, $2, $3, $4, true, $5)
     RETURNING ${STAFF_COLUMNS}`,
    [input.username, input.name, input.role, input.passwordHash, now]
  );
  const row = result.rows[0];
  if (!row) throw new Error("Không tạo được tài khoản nhân viên.");
  return staffFromRow(row);
}

export async function updateStaffActive(
  id: number,
  active: boolean
): Promise<boolean> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query(
    "UPDATE noibo_staff SET active = $1 WHERE id = $2",
    [active, id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function updateStaffPassword(
  id: number,
  passwordHash: string
): Promise<boolean> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query(
    "UPDATE noibo_staff SET password_hash = $1 WHERE id = $2",
    [passwordHash, id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function createSession(input: {
  tokenHash: string;
  staffId: number;
  expiresAt: string;
}): Promise<void> {
  await ensureNoiboInit();
  const now = new Date().toISOString();
  await getPostgresPool().query(
    `INSERT INTO noibo_sessions (token_hash, staff_id, expires_at, created_at)
     VALUES ($1, $2, $3, $4)`,
    [input.tokenHash, input.staffId, input.expiresAt, now]
  );
}

export async function getSessionStaff(
  tokenHash: string
): Promise<NoiboStaff | null> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<
    StaffRow & { expires_at: string }
  >(
    `SELECT st.id, st.username, st.name, st.role, st.active, st.created_at, s.expires_at
     FROM noibo_sessions s
     JOIN noibo_staff st ON st.id = s.staff_id
     WHERE s.token_hash = $1`,
    [tokenHash]
  );
  const row = result.rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await deleteSession(tokenHash).catch(() => undefined);
    return null;
  }
  return staffFromRow(row);
}

export async function deleteSession(tokenHash: string): Promise<void> {
  await ensureNoiboInit();
  await getPostgresPool().query(
    "DELETE FROM noibo_sessions WHERE token_hash = $1",
    [tokenHash]
  );
}

export async function deleteSessionsForStaff(staffId: number): Promise<void> {
  await ensureNoiboInit();
  await getPostgresPool().query(
    "DELETE FROM noibo_sessions WHERE staff_id = $1",
    [staffId]
  );
}

type TaskRow = {
  id: number;
  title: string;
  assignee_id: number | null;
  assignee_name: string | null;
  due_date: string | null;
  status: string;
  note: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

function taskFromRow(r: TaskRow): NoiboTask {
  return {
    id: r.id,
    title: r.title,
    assigneeId: r.assignee_id,
    assigneeName: r.assignee_name ?? undefined,
    dueDate: r.due_date,
    status:
      r.status === "doing" ? "doing" : r.status === "done" ? "done" : "todo",
    note: r.note,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const TASK_COLUMNS = `t.id, t.title, t.assignee_id, st.name AS assignee_name,
  t.due_date, t.status, t.note, t.created_by, t.created_at, t.updated_at
  FROM noibo_tasks t LEFT JOIN noibo_staff st ON st.id = t.assignee_id`;

export async function listTasks(): Promise<NoiboTask[]> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<TaskRow>(
    `SELECT ${TASK_COLUMNS}
     ORDER BY
       CASE t.status WHEN 'todo' THEN 0 WHEN 'doing' THEN 1 ELSE 2 END,
       (t.due_date IS NULL), t.due_date, t.id DESC`
  );
  return result.rows.map(taskFromRow);
}

export async function getTaskById(id: number): Promise<NoiboTask | null> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<TaskRow>(
    `SELECT ${TASK_COLUMNS} WHERE t.id = $1`,
    [id]
  );
  const row = result.rows[0];
  return row ? taskFromRow(row) : null;
}

export async function insertTask(input: {
  title: string;
  assigneeId: number | null;
  dueDate: string | null;
  note: string | null;
  createdBy: number | null;
}): Promise<NoiboTask> {
  await ensureNoiboInit();
  const now = new Date().toISOString();
  const inserted = await getPostgresPool().query<{ id: number }>(
    `INSERT INTO noibo_tasks
       (title, assignee_id, due_date, status, note, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, 'todo', $4, $5, $6, $6)
     RETURNING id`,
    [
      input.title,
      input.assigneeId,
      input.dueDate,
      input.note,
      input.createdBy,
      now,
    ]
  );
  const id = inserted.rows[0]?.id;
  if (id === undefined) throw new Error("Không tạo được công việc.");
  const task = await getTaskById(id);
  if (!task) throw new Error("Không tạo được công việc.");
  return task;
}

export async function updateTaskStatus(
  id: number,
  status: "todo" | "doing" | "done"
): Promise<boolean> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query(
    "UPDATE noibo_tasks SET status = $1, updated_at = $2 WHERE id = $3",
    [status, new Date().toISOString(), id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteTask(id: number): Promise<boolean> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query(
    "DELETE FROM noibo_tasks WHERE id = $1",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

type ShiftRow = {
  id: number;
  date: string;
  staff_id: number;
  staff_name: string | null;
  label: string;
  note: string | null;
};

function shiftFromRow(r: ShiftRow): NoiboShift {
  return {
    id: r.id,
    date: r.date,
    staffId: r.staff_id,
    staffName: r.staff_name ?? undefined,
    label: r.label,
    note: r.note,
  };
}

const SHIFT_COLUMNS = `s.id, s.date, s.staff_id, st.name AS staff_name,
  s.label, s.note
  FROM noibo_shifts s LEFT JOIN noibo_staff st ON st.id = s.staff_id`;

export async function listShiftsBetween(
  startDate: string,
  endDate: string
): Promise<NoiboShift[]> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<ShiftRow>(
    `SELECT ${SHIFT_COLUMNS}
     WHERE s.date >= $1 AND s.date <= $2
     ORDER BY s.date, s.label, s.staff_id`,
    [startDate, endDate]
  );
  return result.rows.map(shiftFromRow);
}

export async function getShiftById(id: number): Promise<NoiboShift | null> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<ShiftRow>(
    `SELECT ${SHIFT_COLUMNS} WHERE s.id = $1`,
    [id]
  );
  const row = result.rows[0];
  return row ? shiftFromRow(row) : null;
}

export async function insertShift(input: {
  date: string;
  staffId: number;
  label: string;
  note: string | null;
}): Promise<NoiboShift> {
  await ensureNoiboInit();
  // Explicit existence check first: ON CONFLICT DO NOTHING + RETURNING
  // reports a row for the conflicting insert under pg-mem, so the
  // pre-check is what actually refuses the duplicate (and it gives the
  // same result on real Postgres).
  const existing = await getPostgresPool().query(
    "SELECT id FROM noibo_shifts WHERE date = $1 AND staff_id = $2 AND label = $3",
    [input.date, input.staffId, input.label]
  );
  if ((existing.rowCount ?? 0) > 0) throw new Error("Ca này đã có rồi.");
  const inserted = await getPostgresPool().query<{ id: number }>(
    `INSERT INTO noibo_shifts (date, staff_id, label, note)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (date, staff_id, label) DO NOTHING
     RETURNING id`,
    [input.date, input.staffId, input.label, input.note]
  );
  const id = inserted.rows[0]?.id;
  if (id === undefined) throw new Error("Ca này đã có rồi.");
  const shift = await getShiftById(id);
  if (!shift) throw new Error("Không xếp được ca làm.");
  return shift;
}

export async function deleteShift(id: number): Promise<boolean> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query(
    "DELETE FROM noibo_shifts WHERE id = $1",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function readNoiboSettings(): Promise<NoiboSettings | null> {
  await ensureNoiboInit();
  const result = await getPostgresPool().query<{ data: NoiboSettings }>(
    "SELECT data FROM noibo_settings WHERE id = 1"
  );
  return result.rows[0]?.data ?? null;
}

export async function writeNoiboSettings(s: NoiboSettings): Promise<void> {
  await ensureNoiboInit();
  await getPostgresPool().query(
    `INSERT INTO noibo_settings (id, data) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET data = excluded.data`,
    [JSON.stringify(s)]
  );
}
