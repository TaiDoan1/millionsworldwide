/**
 * File-based storage backend.
 *
 * Used on Railway (or any host with a persistent disk): attach a persistent
 * volume at the data directory and orders / signups / settings survive
 * restarts. The directory defaults to <project>/app/data and can be moved
 * with the DATA_DIR environment variable.
 */
import fs from "fs/promises";
import path from "path";

export function dataDir(): string {
  return process.env.DATA_DIR || path.join(process.cwd(), "app/data");
}

/**
 * Per-file write queue for this server instance. File storage has no
 * transactions: without this, two checkouts racing through
 * read → append → write would both read the same list and the second
 * write would silently drop the first order. Every read-modify-write
 * in backend/storage/index.ts runs inside this lock for its file.
 * (The KV backend does not need it: RPUSH / HSETNX are atomic.)
 */
const fileQueues = new Map<string, Promise<unknown>>();

export function withFileLock<T>(
  fileName: string,
  fn: () => Promise<T>
): Promise<T> {
  const prev = fileQueues.get(fileName) ?? Promise.resolve();
  const run = prev.then(fn);
  // The stored chain never rejects, so one failed write can't poison later
  // writes; the caller still sees fn's own result through `run`.
  fileQueues.set(
    fileName,
    run.then(
      () => undefined,
      () => undefined
    )
  );
  return run;
}

async function readJson(fileName: string, dir: string): Promise<unknown> {
  let data: string;
  try {
    data = await fs.readFile(path.join(dir, fileName), "utf-8");
  } catch {
    return null; // Missing file: treated as empty, as before.
  }
  try {
    return JSON.parse(data) as unknown;
  } catch {
    // A file that exists but won't parse must NEVER be treated as empty:
    // the next write would silently erase everything it held. Fail loud
    // instead; the previous good version survives in the .bak file.
    throw new Error(
      `Corrupt data file, refusing to treat as empty: ${fileName}`
    );
  }
}

export async function readArray<T>(fileName: string): Promise<T[]> {
  const parsed = await readJson(fileName, dataDir());
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

/**
 * Atomic write: the new content goes to a temp file (fsynced), the
 * previous good version is kept as .bak, then the temp file is renamed
 * over the target. A reader therefore always sees the old file or the
 * new file — never a half-written one — even if the process dies mid-write.
 */
async function atomicWrite(fileName: string, content: string): Promise<void> {
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, fileName);
  const tmp = `${target}.tmp`;
  const handle = await fs.open(tmp, "w");
  try {
    await handle.writeFile(content, "utf-8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await fs.copyFile(target, `${target}.bak`).catch(() => {
    // No previous file yet (first write): nothing to back up.
  });
  await fs.rename(tmp, target);
}

export async function writeArray<T>(fileName: string, arr: T[]): Promise<void> {
  await atomicWrite(fileName, JSON.stringify(arr, null, 2));
}

export async function readObject<T extends object>(fileName: string): Promise<T | null> {
  const parsed = await readJson(fileName, dataDir());
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as T)
    : null;
}

export async function writeObject<T extends object>(
  fileName: string,
  obj: T
): Promise<void> {
  await atomicWrite(fileName, JSON.stringify(obj, null, 2));
}

/**
 * Bundled seed file shipped with the repo. Used as the settings default on
 * backends where the data file is not the source of truth (KV), so the
 * launch configuration in the repo is never silently dropped.
 */
export async function readSeedObject<T extends object>(
  fileName: string
): Promise<T | null> {
  const parsed = await readJson(fileName, path.join(process.cwd(), "app/data"));
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as T)
    : null;
}
