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

function dataDir(): string {
  return process.env.DATA_DIR || path.join(process.cwd(), "app/data");
}

async function readJson(fileName: string, dir: string): Promise<unknown> {
  try {
    const data = await fs.readFile(path.join(dir, fileName), "utf-8");
    return JSON.parse(data) as unknown;
  } catch {
    return null;
  }
}

export async function readArray<T>(fileName: string): Promise<T[]> {
  const parsed = await readJson(fileName, dataDir());
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

export async function writeArray<T>(fileName: string, arr: T[]): Promise<void> {
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), JSON.stringify(arr, null, 2), "utf-8");
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
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), JSON.stringify(obj, null, 2), "utf-8");
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
