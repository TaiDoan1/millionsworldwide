"use client";

import type { ProductColor } from "../data/products";
import { checkboxClass, FieldLabel, inputClassSm } from "./ui";
import { AddButton, RemoveButton } from "./ui-client";
import ImageUpload from "./ImageUpload";

/**
 * Per-color editor: each row is a color name + swatch code + its own
 * photos + sold-out toggle. Picking a color on the detail page swaps
 * the gallery to that color's photos (a color with no photos keeps
 * the product's photos). Empty labels are dropped on save
 * (server-side too). When the list is empty, no color picker shows
 * on the detail page.
 */
export default function ColorsEditor({
  colors,
  onChange,
}: {
  colors: ProductColor[];
  onChange: (colors: ProductColor[]) => void;
}) {
  function update(index: number, patch: Partial<ProductColor>) {
    onChange(colors.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function remove(index: number) {
    onChange(colors.filter((_, i) => i !== index));
  }

  function addImage(index: number, url: string) {
    const c = colors[index];
    update(index, { images: [...(c.images ?? []), url] });
  }

  function removeImage(index: number, imageIndex: number) {
    const c = colors[index];
    update(index, {
      images: (c.images ?? []).filter((_, j) => j !== imageIndex),
    });
  }

  function moveImage(index: number, from: number, to: number) {
    const c = colors[index];
    const images = [...(c.images ?? [])];
    if (to < 0 || to >= images.length) return;
    const [moved] = images.splice(from, 1);
    images.splice(to, 0, moved);
    update(index, { images });
  }

  return (
    <div>
      <FieldLabel mb={2}>Màu &amp; ảnh theo màu</FieldLabel>
      {colors.length === 0 ? (
        <p className="text-xs text-gray-400 mb-2">
          Chưa có màu — trang chi tiết không hiện chọn màu, khách xem ảnh
          chung của sản phẩm.
        </p>
      ) : (
        <div className="flex flex-col gap-4 mb-2">
          {colors.map((c, i) => {
            const images = c.images ?? [];
            return (
              <div key={i} className="rounded border border-neutral-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    aria-hidden
                    className="h-6 w-6 shrink-0 rounded-full border border-neutral-300"
                    style={{ backgroundColor: c.hex ?? "#ffffff" }}
                  />
                  <input
                    type="text"
                    value={c.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    placeholder="VD: Đen"
                    maxLength={20}
                    className={`${inputClassSm} w-32`}
                  />
                  <input
                    type="color"
                    value={c.hex ?? "#000000"}
                    onChange={(e) => update(i, { hex: e.target.value })}
                    aria-label={`Mã màu của ${c.label || "màu"}`}
                    className="h-9 w-10 cursor-pointer bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={c.hex ?? ""}
                    onChange={(e) => update(i, { hex: e.target.value })}
                    placeholder="#111111"
                    maxLength={7}
                    className={`${inputClassSm} w-24`}
                  />
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={c.soldOut ?? false}
                      onChange={(e) => update(i, { soldOut: e.target.checked })}
                      className={checkboxClass}
                    />
                    Hết hàng
                  </label>
                  <RemoveButton
                    onClick={() => remove(i)}
                    label={`Xóa màu ${c.label}`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Ảnh của màu này — chọn màu trên trang chi tiết sẽ đổi
                  sang các ảnh dưới đây (để trống thì giữ ảnh chung).
                </p>
                {images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((src, j) => (
                      <div key={`${src}-${j}`} className="flex flex-col items-center gap-1">
                        <div className="relative h-16 w-11 overflow-hidden rounded bg-neutral-100">
                          {/* Plain img on purpose: admin thumbnails. */}
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i, j)}
                            aria-label="Xóa ảnh này"
                            className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[10px] leading-none text-white"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={j === 0}
                            onClick={() => moveImage(i, j, j - 1)}
                            aria-label="Ảnh lên trước"
                            className="h-5 w-5 rounded border border-neutral-300 text-xs leading-none text-black disabled:opacity-30"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            disabled={j === images.length - 1}
                            onClick={() => moveImage(i, j, j + 1)}
                            aria-label="Ảnh xuống sau"
                            className="h-5 w-5 rounded border border-neutral-300 text-xs leading-none text-black disabled:opacity-30"
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2">
                  <ImageUpload onUploaded={(url) => addImage(i, url)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <AddButton onClick={() => onChange([...colors, { label: "" }])}>
        + Thêm màu
      </AddButton>
    </div>
  );
}
