"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnOutline, removeBtnClass } from "./ui";
import { pageWindow } from "./pager";

/**
 * Client-only admin bits: the shared save flow and the small
 * interactive buttons. Kept apart from ui.tsx so the section shell
 * stays usable from server components.
 */

type SaveResult = { success: boolean; error?: string };

/**
 * The save flow every admin form repeats: saving flag, inline message,
 * refresh the page on success. Returns true when the save succeeded.
 */
export function useAdminSave() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(
    fn: () => Promise<SaveResult>,
    okMessage: string,
  ): Promise<boolean> {
    setSaving(true);
    setMessage("");
    const result = await fn();
    setSaving(false);
    if (result.success) {
      setMessage(okMessage);
      router.refresh();
      return true;
    }
    setMessage(result.error ?? "Không lưu được.");
    return false;
  }

  return { saving, message, setMessage, save };
}

/** Nút × gỡ 1 dòng (size, món lẻ, ảnh, danh mục). */
export function RemoveButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={removeBtnClass}
    >
      ×
    </button>
  );
}

/** Nút thêm outline: "+ Thêm size", "+ Thêm món lẻ". */
export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={btnOutline}>
      {children}
    </button>
  );
}

/**
 * Pager dùng chung cho các danh sách trong quản trị (đơn, sản phẩm,
 * email): ‹ › + số trang + "Trang X / Y". Ẩn hẳn khi chỉ có 1 trang.
 */
export function Pager({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
}) {
  if (pages <= 1) return null;
  const btn =
    "min-w-9 px-2 py-2 text-sm font-bold border border-neutral-300 bg-white hover:border-black transition-colors disabled:opacity-30";
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        aria-label="Trang trước"
        className={btn}
      >
        ‹
      </button>
      {pageWindow(page, pages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-label={`Trang ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${p === page ? "bg-black text-white border-black" : ""}`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        aria-label="Trang sau"
        className={btn}
      >
        ›
      </button>
      <span className="ml-1 text-sm text-gray-600">
        Trang {page} / {pages}
      </span>
    </div>
  );
}
