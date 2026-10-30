import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
      <p className="text-sm font-semibold tracking-[0.3em]">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Không tìm thấy trang này
      </h1>
      <p className="mt-3 max-w-md text-sm text-gray-500">
        Liên kết có thể đã đổi hoặc không còn tồn tại. Anh/chị quay lại trang
        chủ hoặc vào shop nhé.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          Về trang chủ
        </Link>
        <Link
          href="/trangchu"
          className="border border-black px-6 py-3 text-sm font-semibold"
        >
          Vào shop
        </Link>
      </div>
    </main>
  );
}
