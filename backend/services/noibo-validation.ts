/**
 * Pure validation for the internal staff pages (/noibo). No imports
 * from storage or next/*, so these can be unit-tested directly.
 * Every message is user-facing Vietnamese.
 */

export function cleanUsername(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validateUsername(username: string): string | null {
  if (username.length < 3 || username.length > 30) {
    return "Tên đăng nhập phải từ 3 đến 30 ký tự.";
  }
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return "Tên đăng nhập chỉ dùng chữ thường, số, dấu chấm, gạch dưới và gạch ngang.";
  }
  return null;
}

export function validateStaffName(name: string): string | null {
  const clean = typeof name === "string" ? name.trim() : "";
  if (clean.length < 1 || clean.length > 50) {
    return "Tên nhân viên phải từ 1 đến 50 ký tự.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (typeof password !== "string" || password.length < 6) {
    return "Mật khẩu phải từ 6 ký tự trở lên.";
  }
  if (password.length > 100) {
    return "Mật khẩu tối đa 100 ký tự.";
  }
  return null;
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function validateTaskTitle(title: string): string | null {
  const clean = typeof title === "string" ? title.trim() : "";
  if (clean.length < 1 || clean.length > 200) {
    return "Tên công việc phải từ 1 đến 200 ký tự.";
  }
  return null;
}

export function validateTaskNote(note: string | null): string | null {
  if (note !== null && note.length > 500) {
    return "Ghi chú công việc tối đa 500 ký tự.";
  }
  return null;
}

export function validateShiftLabel(label: string): string | null {
  const clean = typeof label === "string" ? label.trim() : "";
  if (clean.length < 1 || clean.length > 50) {
    return "Tên ca làm phải từ 1 đến 50 ký tự.";
  }
  return null;
}

export function validateShiftNote(note: string | null): string | null {
  if (note !== null && note.length > 200) {
    return "Ghi chú ca làm tối đa 200 ký tự.";
  }
  return null;
}

export function validateAnnouncement(text: string): string | null {
  if (text.length > 500) {
    return "Thông báo chung tối đa 500 ký tự.";
  }
  return null;
}

export function validateShiftTemplates(templates: string[]): string | null {
  if (templates.length > 20) {
    return "Tối đa 20 mẫu ca làm.";
  }
  for (const t of templates) {
    const problem = validateShiftLabel(t);
    if (problem) return problem;
  }
  return null;
}
