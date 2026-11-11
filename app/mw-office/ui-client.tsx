"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnOutline, removeBtnClass } from "./ui";

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
