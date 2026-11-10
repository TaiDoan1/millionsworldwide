"use client";

import { useRef, useState } from "react";

/**
 * One photo upload from /mw-office: picks a file, POSTs it to
 * /api/admin/upload, and hands the returned URL back to the form
 * that owns the image list. The file itself lands on the Railway
 * volume — the form only ever holds the URL path.
 */
export default function ImageUpload({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: unknown;
        error?: unknown;
      };
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Không tải được ảnh.",
        );
      } else if (typeof data.url === "string") {
        onUploaded(data.url);
      } else {
        setError("Không tải được ảnh.");
      }
    } catch {
      setError("Không tải được ảnh, kiểm tra mạng rồi thử lại.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="block w-full text-sm text-gray-600 file:mr-3 file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-wider hover:file:border-black disabled:opacity-50"
      />
      <p className="text-[11px] text-gray-400 mt-1">
        {uploading
          ? "Đang tải ảnh lên…"
          : "Ảnh jpg, png hoặc webp, tối đa 5MB — web tự resize về cỡ vừa hiển thị."}
      </p>
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
}
