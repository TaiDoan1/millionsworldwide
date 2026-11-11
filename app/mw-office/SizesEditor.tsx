"use client";

import type { SizeOption } from "../data/products";
import { checkboxClass, FieldLabel, inputClassSm } from "./ui";
import { AddButton, RemoveButton } from "./ui-client";

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
      <FieldLabel mb={2}>Size &amp; tồn kho theo size</FieldLabel>
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
                className={`${inputClassSm} w-24`}
              />
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={s.soldOut ?? false}
                  onChange={(e) => update(i, { soldOut: e.target.checked })}
                  className={checkboxClass}
                />
                Hết hàng
              </label>
              <RemoveButton
                onClick={() => remove(i)}
                label={`Xóa size ${s.label}`}
              />
            </div>
          ))}
        </div>
      )}
      <AddButton onClick={() => onChange([...sizes, { label: "" }])}>
        + Thêm size
      </AddButton>
    </div>
  );
}
