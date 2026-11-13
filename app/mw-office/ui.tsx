import type { ReactNode } from "react";

/**
 * Shared admin UI primitives (server-safe: no event handlers here).
 * Every section, field and button on /mw-office is built from these,
 * so the look stays identical while the forms stop re-declaring it.
 */

/** Khung mục trắng chung: tiêu đề + mô tả + nội dung. */
export function AdminSection({
  id,
  title,
  description,
  descriptionClassName,
  actions,
  narrow,
  noTopMargin,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  descriptionClassName?: string;
  /** Extra controls on the title row (e.g. the CSV export button). */
  actions?: ReactNode;
  /** The settings section is narrower than the rest. */
  narrow?: boolean;
  /** The first section sits right under the page header (no mt-10). */
  noTopMargin?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className={`${narrow ? "max-w-xl" : "max-w-3xl"} mx-auto bg-white p-5 sm:p-8 shadow-xl shadow-black/5 ${noTopMargin ? "" : "mt-10 "}scroll-mt-32`}
    >
      <div
        className={`flex flex-wrap items-start justify-between gap-4 ${description ? "mb-1" : "mb-8"}`}
      >
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {actions}
      </div>
      {description && (
        <p
          className={
            descriptionClassName ?? "text-base text-gray-600 mb-8"
          }
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

/** Nhãn ô nhập: chữ vừa, đậm, tối màu — đọc được trên điện thoại. */
export function FieldLabel({
  children,
  mb = 1,
}: {
  children: ReactNode;
  /** 1 = mb-1 (form sản phẩm), 2 = mb-2 (form cài đặt, editor). */
  mb?: 1 | 2;
}) {
  return (
    <label
      className={`block text-sm font-semibold tracking-wider uppercase ${mb === 2 ? "mb-2" : "mb-1"} text-gray-800`}
    >
      {children}
    </label>
  );
}

/** Dòng ghi chú nhỏ dưới ô nhập. */
export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-gray-500 mt-1">{children}</p>;
}

/** Ô nhập: phần chung (dùng cho cả ô có và không có w-full). Chữ 16px
 *  để trình duyệt trên điện thoại không tự phóng to khi bấm vào ô. */
export const inputClassBase =
  "border border-gray-300 p-3 text-base rounded-sm focus:outline-none focus:border-black";

/** Ô nhập text/number/select, rộng hết hàng (form sản phẩm, tìm đơn). */
export const inputClass = `w-full ${inputClassBase}`;

/** Ô nhập nhỏ trong 1 hàng (size, món lẻ, danh mục). */
export const inputClassSm =
  "border border-gray-300 p-2.5 text-base rounded-sm focus:outline-none focus:border-black";

/** Ô nhập rộng, padding lớn hơn (form cài đặt). */
export const inputClassLg =
  "w-full border border-gray-300 p-3.5 text-base rounded-sm focus:outline-none focus:border-black";

/** Select dùng chung inputClass + nền trắng. */
export const selectClass = `${inputClass} bg-white`;

/** Checkbox vuông đen. */
export const checkboxClass = "w-4 h-4 accent-black";

/** Nút lưu đen (form sản phẩm). */
export const btnPrimary =
  "bg-black text-white px-6 py-3 text-sm font-bold tracking-widest uppercase hover:opacity-80 transition-opacity disabled:opacity-50";

/** Nút lưu đen, cỡ lớn (form cài đặt). */
export const btnPrimaryLg =
  "bg-black text-white px-8 py-4 text-sm font-bold tracking-widest uppercase w-fit hover:opacity-80 transition-opacity disabled:opacity-50 mt-4";

/** Nút thêm (outline): "+ Thêm size", "+ Thêm món lẻ", "+ Thêm danh mục". */
export const btnOutline =
  "text-sm font-bold tracking-wider uppercase border border-gray-300 px-3 py-2 hover:border-black transition-colors";

/** Nút × gỡ 1 dòng/ảnh. */
export const removeBtnClass =
  "text-gray-400 hover:text-black text-lg leading-none px-1";

/** Chữ báo trạng thái lưu bên cạnh nút lưu. */
export const messageClass = "text-sm text-gray-600";

/** Nút submit đen dùng chung cho các form. */
export function SaveButton({
  saving,
  savingLabel,
  disabled,
  children,
  className,
}: {
  saving: boolean;
  savingLabel: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled ?? saving}
      className={className ?? btnPrimary}
    >
      {saving ? savingLabel : children}
    </button>
  );
}
