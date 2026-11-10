"use client";

import type { ProductPiece } from "../data/products";

/**
 * "Giá lẻ" editor: each row is one piece of a set (id + name + its
 * own price). Empty-name rows are dropped on save (server-side too).
 * Piece ids must be unique across the whole shop — the server refuses
 * a save when an id is already used by another product or piece.
 * When the list is empty, the detail page shows no "Mua lẻ" section
 * and the set is only sold as a whole.
 */
export default function PiecesEditor({
  pieces,
  onChange,
}: {
  pieces: ProductPiece[];
  onChange: (pieces: ProductPiece[]) => void;
}) {
  function update(index: number, patch: Partial<ProductPiece>) {
    onChange(pieces.map((pc, i) => (i === index ? { ...pc, ...patch } : pc)));
  }

  function remove(index: number) {
    onChange(pieces.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
        Món lẻ trong set (giá lẻ)
      </label>
      {pieces.length === 0 ? (
        <p className="text-xs text-gray-400 mb-2">
          Chưa có món lẻ — trang chi tiết chỉ bán cả set. Thêm món bên
          dưới để khách mua lẻ từng món ngay trên trang chi tiết.
        </p>
      ) : (
        <div className="flex flex-col gap-2 mb-2">
          {pieces.map((pc, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={pc.id}
                onChange={(e) => update(i, { id: e.target.value })}
                placeholder="Mã: set-hoodie-black-hoodie"
                maxLength={50}
                className="w-56 border border-gray-300 p-2 text-sm rounded-sm focus:outline-none focus:border-black font-mono text-xs"
              />
              <input
                type="text"
                value={pc.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Tên món (VD: Hoodie)"
                maxLength={100}
                className="w-40 border border-gray-300 p-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
              <input
                type="number"
                min={1}
                step={1}
                value={pc.price || ""}
                onChange={(e) =>
                  update(i, { price: Number(e.target.value) || 0 })
                }
                placeholder="Giá lẻ"
                className="w-24 border border-gray-300 p-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
              <span className="text-xs text-gray-400">nghìn đồng</span>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Xóa món lẻ ${pc.name}`}
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
        onClick={() => onChange([...pieces, { id: "", name: "", price: 0 }])}
        className="text-xs font-bold tracking-wider uppercase border border-gray-300 px-3 py-1.5 hover:border-black transition-colors"
      >
        + Thêm món lẻ
      </button>
    </div>
  );
}
