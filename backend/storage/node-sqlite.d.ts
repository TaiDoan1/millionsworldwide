/**
 * Minimal types for Node's built-in node:sqlite module.
 * @types/node 20 (what this project pins) does not ship them yet, so they
 * are declared here instead of pulling a newer @types/node just for this.
 * Only the API backend/storage/sqlite.ts actually uses is declared.
 */
declare module "node:sqlite" {
  export interface StatementSync {
    get(
      ...params: unknown[]
    ): Record<string, unknown> | undefined;
    all(...params: unknown[]): Record<string, unknown>[];
    run(...params: unknown[]): {
      changes: number | bigint;
      lastInsertRowid: number | bigint;
    };
  }

  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
