"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginStaff } from "../actions/noibo";

/**
 * Staff login form for /noibo. On success the page re-renders as the
 * dashboard (the action revalidates /noibo; refresh() picks it up).
 */
export default function NoiboLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result = await loginStaff(username, password);
    setBusy(false);
    if (!result.success) {
      setError(result.error ?? "Đăng nhập không được.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-lg font-bold">Đăng nhập nội bộ</h1>
      <p className="mb-6 text-sm text-black/60">
        Dùng tài khoản nhân viên để xem lịch làm việc và công việc được giao.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Tên đăng nhập</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full rounded-lg border border-black/20 p-3 text-base"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Mật khẩu</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-black/20 p-3 text-base"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
