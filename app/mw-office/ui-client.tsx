"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { btnOutline, removeBtnClass } from "./ui";
import { pageWindow } from "./pager";

type SavePopupState = { ok: boolean; text: string } | null;

/**
 * One toast for every admin save: fixed at the top of the screen so
 * it is seen even when the save button is far below the fold. Green
 * with a tick on success, red with a cross on failure; closes itself
 * after a few seconds, or at once on the × button.
 */
export function SavePopup({
  popup,
  onClose,
}: {
  popup: SavePopupState;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!popup) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [popup, onClose]);
  if (!popup) return null;
  return (
    <div
      role={popup.ok ? "status" : "alert"}
      className={`fixed left-1/2 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-[12px] px-4 py-3 text-sm font-medium text-white shadow-lg ${
        popup.ok ? "bg-green-700" : "bg-red-700"
      }`}
    >
      <span aria-hidden className="text-base leading-none">
        {popup.ok ? "✓" : "✕"}
      </span>
      <span className="flex-1">{popup.text}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng thông báo"
        className="text-base leading-none opacity-80 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Client-only admin bits: the shared save flow and the small
 * interactive buttons. Kept apart from ui.tsx so the section shell
 * stays usable from server components.
 */

type SaveResult = { success: boolean; error?: string };

/**
 * The save flow every admin form repeats: saving flag, inline message,
 * a toast popup (success/failure) on top, refresh the page on success.
 * Returns true when the save succeeded. Render the returned `popup`
 * element next to the save button.
 */
export function useAdminSave() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [popup, setPopup] = useState<SavePopupState>(null);

  async function save(
    fn: () => Promise<SaveResult>,
    okMessage: string,
  ): Promise<boolean> {
    setSaving(true);
    setMessage("");
    setPopup(null);
    const result = await fn();
    setSaving(false);
    if (result.success) {
      setMessage(okMessage);
      setPopup({ ok: true, text: okMessage });
      router.refresh();
      return true;
    }
    const error = result.error ?? "Không lưu được.";
    setMessage(error);
    setPopup({ ok: false, text: error });
    return false;
  }

  return {
    saving,
    message,
    setMessage,
    save,
    popup: <SavePopup popup={popup} onClose={() => setPopup(null)} />,
  };
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
