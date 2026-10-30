// Vercel KV backend was removed (2026-10-30): the shop runs on Railway
// with Postgres, so the KV branch is gone from backend/storage/index.ts
// and backend/storage/kv.ts no longer exists. This file is intentionally
// left as an empty module (snapshot pushes cannot delete files) so that
// nothing breaks if an old import still references this path.
export {};
