"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
      <h1 className="text-3xl font-bold tracking-tight">Có lỗi xảy ra</h1>
      <p className="mt-3 max-w-md text-sm text-gray-500">
        Trang này đang gặp sự cố tạm thời. Anh/chị thử tải lại, nếu vẫn lỗi
        thì quay lại sau giúp shop nhé.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => retry()}
          className="bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="border border-black px-6 py-3 text-sm font-semibold"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
