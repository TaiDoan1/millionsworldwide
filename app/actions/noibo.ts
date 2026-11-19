"use server";

import {
  createShift as createShiftService,
  createStaff as createStaffService,
  createTask as createTaskService,
  deleteShift as deleteShiftService,
  deleteTask as deleteTaskService,
  getNoiboSettings as getNoiboSettingsService,
  listNoiboShifts as listNoiboShiftsService,
  listNoiboStaff as listNoiboStaffService,
  listNoiboTasks as listNoiboTasksService,
  loginStaff as loginStaffService,
  logoutStaff as logoutStaffService,
  resetStaffPassword as resetStaffPasswordService,
  saveNoiboSettings as saveNoiboSettingsService,
  setStaffActive as setStaffActiveService,
  updateTaskStatus as updateTaskStatusService,
  type NoiboTaskStatus,
} from "../../backend/services/noibo";
import { getNoiboSessionStaff } from "../../backend/auth/noibo-auth";

export type {
  NoiboSettings,
  NoiboShift,
  NoiboStaff,
  NoiboTask,
  NoiboTaskStatus,
} from "../../backend/services/noibo";

/** The staff member behind the current /noibo session, or null. */
export async function getNoiboSessionStaffAction() {
  return getNoiboSessionStaff();
}

/** Staff login with username + password. */
export async function loginStaff(username: string, password: string) {
  return loginStaffService(username, password);
}

/** Log the current staff session out. */
export async function logoutStaff() {
  return logoutStaffService();
}

/** Founder-only: add a staff account. */
export async function createStaff(input: {
  username: string;
  name: string;
  role: "founder" | "staff";
  password: string;
}) {
  return createStaffService(input);
}

/** Founder-only: lock/unlock a staff account. */
export async function setStaffActive(id: number, active: boolean) {
  return setStaffActiveService(id, active);
}

/** Founder-only: set a new password for a staff account. */
export async function resetStaffPassword(id: number, newPassword: string) {
  return resetStaffPasswordService(id, newPassword);
}

/** Founder-only: create a task. */
export async function createTask(input: {
  title: string;
  assigneeId: number | null;
  dueDate: string | null;
  note: string | null;
}) {
  return createTaskService(input);
}

/** Change a task's status (own tasks for staff, any task for founders). */
export async function updateTaskStatus(id: number, status: NoiboTaskStatus) {
  return updateTaskStatusService(id, status);
}

/** Founder-only: delete a task. */
export async function deleteTask(id: number) {
  return deleteTaskService(id);
}

/** Founder-only: put a staff member on a shift for one day. */
export async function createShift(input: {
  date: string;
  staffId: number;
  label: string;
  note: string | null;
}) {
  return createShiftService(input);
}

/** Founder-only: remove a shift. */
export async function deleteShift(id: number) {
  return deleteShiftService(id);
}

/** Founder-only: save the announcement + shift-label templates. */
export async function saveNoiboSettings(input: {
  announcement: string;
  shiftTemplates: string[];
}) {
  return saveNoiboSettingsService(input);
}

/** Internal settings (announcement + shift templates). */
export async function getNoiboSettings() {
  return getNoiboSettingsService();
}

/** Founder-only: full staff list. */
export async function listNoiboStaff() {
  return listNoiboStaffService();
}

/** All tasks, ordered by status then deadline. */
export async function listNoiboTasks() {
  return listNoiboTasksService();
}

/** Shifts between two dates (YYYY-MM-DD), inclusive. */
export async function listNoiboShifts(startDate: string, endDate: string) {
  return listNoiboShiftsService(startDate, endDate);
}
