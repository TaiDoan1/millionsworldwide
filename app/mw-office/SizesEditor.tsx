"use client";

import type { SizeOption } from "../data/products";

/**
 * Per-size availability editor: each row is a size label plus its
 * sold-out toggle. Empty labels are dropped on save (server-side too).
 * When the list is empty, no picker shows on the detail page and the
 * shop confirms size by phone, as before.
 */
export default function SizesEditor({
  sizes,
  onChange,
}: {
  sizes: SizeOption[];
  onChange: (sizes: SizeOption[]) => void;
}) {
  function update(index: number, patch: Partial<SizeOption>) {
    onChange(sizes.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function remove(index: number) {
    onChange(sizes.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
        Size &amp; tồn kho theo size
      </label>
      {sizes.length === 0 ? (
        <p className="text-xs text-gray-400 mb-2">
          Chưa có size — trang chi tiết không hiện chọn size, shop xác nhận
          size khi gọi xác nhận đơn.
        </p>
      ) : (
        <div className="flex flex-col gap-2 mb-2">
          {sizes.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={s.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="VD: M"
                maxLength={10}
                className="w-24 border border-gray-300 p-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={s.soldOut ?? false}
                  onChange={(e) => update(i, { soldOut: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                Hết hàng
              </label>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Xóa size ${s.label}`}
                className="text-gray-400 hover:text-black text-lg leading-none px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => onChange([...sizes, { label: "" }])}
        className="text-xs font-bold tracking-wider uppercase border border-gray-300 px-3 py-1.5 hover:border-black transition-colors"
      >
        + Thêm size
      </button>
    </div>
  );
}
