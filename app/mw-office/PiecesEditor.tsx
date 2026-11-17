"use client";

import { useState } from "react";
import { isLinkedPiece, type ProductPiece } from "../data/products";
import { FieldLabel, Hint, inputClassSm } from "./ui";
import { AddButton, RemoveButton } from "./ui-client";
import ImageUpload from "./ImageUpload";

/** URL-safe slug from a label: "Áo Hoodie" → "ao-hoodie". */
function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/đ/g, "d") // NFD does not decompose đ, so map it by hand.
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * "Giá lẻ" editor: each piece is typed here directly — name, price
 * and its own photos. Picking the piece on the detail page swaps the
 * gallery to its photos; size and stock still come from the set
 * itself. No product linking: a piece is not a standalone product.
 * Rows saved long ago as a product link still read (price/size from
 * that product) and can be removed, but no new link can be made.
 */
export default function PiecesEditor({
  pieces,
  onChange,
}: {
  pieces: ProductPiece[];
  onChange: (pieces: ProductPiece[]) => void;
}) {
  // Which rows had their id (mã) edited by hand — those stop following
  // the name; the rest auto-slug from the name like the category form.
  const [idTouched, setIdTouched] = useState<Record<number, boolean>>({});

  function update(index: number, patch: Partial<ProductPiece>) {
    onChange(pieces.map((pc, i) => (i === index ? { ...pc, ...patch } : pc)));
  }

  function remove(index: number) {
    onChange(pieces.filter((_, i) => i !== index));
  }

  function addImage(index: number, url: string) {
    const pc = pieces[index];
    update(index, { images: [...(pc.images ?? []), url] });
  }

  function removeImage(index: number, imageIndex: number) {
    const pc = pieces[index];
    update(index, {
      images: (pc.images ?? []).filter((_, j) => j !== imageIndex),
    });
  }

  function moveImage(index: number, from: number, to: number) {
    const pc = pieces[index];
    const images = [...(pc.images ?? [])];
    if (to < 0 || to >= images.length) return;
    const [moved] = images.splice(from, 1);
    images.splice(to, 0, moved);
    update(index, { images });
  }

  return (
    <div>
      <FieldLabel mb={2}>Món lẻ trong set (ảnh + giá riêng)</FieldLabel>
      {pieces.length === 0 ? (
        <p className="text-xs text-gray-400 mb-2">
          Chưa có món lẻ — trang chi tiết chỉ bán cả set. Thêm món bên
          dưới để khách mua lẻ từng món ngay trên trang chi tiết.
        </p>
      ) : (
        <div className="flex flex-col gap-4 mb-2">
          {pieces.map((pc, i) =>
            isLinkedPiece(pc) ? (
              // Old linked row: read-only, kept for data saved before
              // linking was removed from this editor.
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 border border-neutral-200 p-3"
              >
                <span className="text-sm text-gray-500">
                  Món đã link sản phẩm: {pc.productId} — giá và size lấy
                  từ sản phẩm đó (kiểu cũ, xóa để nhập lại kiểu mới)
                </span>
                <RemoveButton
                  onClick={() => remove(i)}
                  label={`Xóa món lẻ ${pc.productId}`}
                />
              </div>
            ) : (
              <div key={i} className="border border-neutral-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={pc.name ?? ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      update(
                        i,
                        idTouched[i]
                          ? { name }
                          : { name, id: slugify(name) },
                      );
                    }}
                    placeholder="Tên món (VD: Áo Hoodie)"
                    maxLength={100}
                    aria-label="Tên món lẻ"
                    className={`${inputClassSm} w-44`}
                  />
                  <input
                    type="number"
                    min={1}
                    value={pc.price ?? ""}
                    onChange={(e) =>
                      update(i, {
                        price:
                          e.target.value === ""
                            ? undefined
                            : Math.floor(Number(e.target.value)),
                      })
                    }
                    placeholder="Giá"
                    aria-label="Giá món lẻ (nghìn đồng)"
                    className={`${inputClassSm} w-28`}
                  />
                  <span className="text-sm text-gray-500">nghìn đồng</span>
                  <RemoveButton
                    onClick={() => remove(i)}
                    label={`Xóa món lẻ ${pc.name ?? ""}`}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">Mã:</span>
                  <input
                    type="text"
                    value={pc.id ?? ""}
                    onChange={(e) => {
                      update(i, { id: e.target.value });
                      setIdTouched((prev) => ({ ...prev, [i]: true }));
                    }}
                    placeholder="ao-hoodie"
                    maxLength={50}
                    aria-label="Mã món lẻ"
                    className={`${inputClassSm} w-44 font-mono text-xs`}
                  />
                  <span className="text-xs text-gray-400">
                    tự điền từ tên, sửa được
                  </span>
                </div>
                {(pc.images ?? []).length > 0 &&
                  (pc.name ?? "").trim().length === 0 && (
                    <p className="mt-2 text-xs font-medium text-red-700">
                      Chưa đặt tên món — món này sẽ không được lưu, nhập
                      tên trước khi lưu nhé.
                    </p>
                  )}
                <div className="mt-3">
                  <p className="text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
                    Ảnh của món
                  </p>
                  {(pc.images ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(pc.images ?? []).map((src, j) => (
                        <div key={src} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            className="h-14 w-14 rounded-[12px] object-cover bg-neutral-100"
                          />
                          <div className="flex justify-center gap-0.5 mt-0.5">
                            <button
                              type="button"
                              disabled={j === 0}
                              onClick={() => moveImage(i, j, j - 1)}
                              aria-label="Đưa ảnh lên trước"
                              className="px-1 text-xs font-bold text-gray-600 hover:text-black disabled:opacity-30"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              disabled={j === (pc.images ?? []).length - 1}
                              onClick={() => moveImage(i, j, j + 1)}
                              aria-label="Đưa ảnh xuống sau"
                              className="px-1 text-xs font-bold text-gray-600 hover:text-black disabled:opacity-30"
                            >
                              ›
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(i, j)}
                              aria-label="Gỡ ảnh"
                              className="px-1 text-xs text-gray-400 hover:text-black"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <ImageUpload onUploaded={(url) => addImage(i, url)} />
                  {(pc.images ?? []).length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Chưa có ảnh — khách chọn món vẫn thấy ảnh của cả set.
                    </p>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
      <AddButton
        onClick={() =>
          onChange([...pieces, { id: "", name: "", price: undefined, images: [] }])
        }
      >
        + Thêm món lẻ
      </AddButton>
      <Hint>
        Mỗi món lẻ có tên, giá và ảnh riêng — khách chọn món trên trang
        chi tiết thì ảnh chính đổi sang ảnh của món đó. Size và hết hàng
        vẫn lấy theo set.
      </Hint>
    </div>
  );
}
