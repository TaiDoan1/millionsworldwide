"use client";

import { isLinkedPiece, type Product, type ProductPiece } from "../data/products";

/**
 * "Giá lẻ" editor: each row LINKS one standalone product into the set.
 * The piece's name/price/sizes/stock all come from that product — the
 * admin never types them here, so the set page and the product's own
 * page can never disagree. Legacy inline rows (saved before linking
 * existed) show read-only: remove one to replace it with a link.
 * When the list is empty, the detail page shows no "Mua lẻ" section
 * and the set is only sold as a whole.
 */
export default function PiecesEditor({
  pieces,
  products,
  ownId,
  onChange,
}: {
  pieces: ProductPiece[];
  /** All products, for the link dropdown. */
  products: Product[];
  /** The set being edited — never offered as its own piece. */
  ownId?: string;
  onChange: (pieces: ProductPiece[]) => void;
}) {
  const linkedIds = new Set(
    pieces.filter(isLinkedPiece).map((pc) => pc.productId),
  );

  function update(index: number, patch: Partial<ProductPiece>) {
    onChange(pieces.map((pc, i) => (i === index ? { ...pc, ...patch } : pc)));
  }

  function remove(index: number) {
    onChange(pieces.filter((_, i) => i !== index));
  }

  /** Linkable products for one row: everything except the set itself
   *  and products already linked in another row (the row's own linked
   *  product stays offered so it isn't lost on re-render). */
  function optionsFor(index: number) {
    const current = isLinkedPiece(pieces[index])
      ? pieces[index].productId
      : "";
    return products.filter(
      (p) =>
        p.id !== ownId && (p.id === current || !linkedIds.has(p.id)),
    );
  }

  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
        Món lẻ trong set (link sản phẩm riêng)
      </label>
      {pieces.length === 0 ? (
        <p className="text-xs text-gray-400 mb-2">
          Chưa có món lẻ — trang chi tiết chỉ bán cả set. Thêm món bên
          dưới để khách mua lẻ từng món ngay trên trang chi tiết.
        </p>
      ) : (
        <div className="flex flex-col gap-2 mb-2">
          {pieces.map((pc, i) =>
            // A row with a productId field is a link (or a fresh empty
            // placeholder waiting for a pick); anything else is a
            // legacy inline row, shown read-only.
            typeof pc.productId === "string" ? (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <select
                  value={pc.productId}
                  onChange={(e) => update(i, { productId: e.target.value })}
                  className="w-64 border border-gray-300 p-2 text-sm rounded-sm focus:outline-none focus:border-black bg-white"
                >
                  <option value="">Chọn sản phẩm…</option>
                  {optionsFor(i).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.id}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-500">
                  {(() => {
                    const linked = products.find(
                      (p) => p.id === pc.productId,
                    );
                    return linked
                      ? `Giá lấy từ sản phẩm: ${linked.price} nghìn đồng`
                      : "Chưa chọn sản phẩm.";
                  })()}
                </span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Xóa món lẻ"
                  className="text-gray-400 hover:text-black text-lg leading-none px-1"
                >
                  ×
                </button>
              </div>
            ) : (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">
                  Món lẻ cũ: {pc.name} — {pc.price} nghìn đồng (kiểu cũ,
                  xóa để link lại sản phẩm riêng)
                </span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Xóa món lẻ ${pc.name}`}
                  className="text-gray-400 hover:text-black text-lg leading-none px-1"
                >
                  ×
                </button>
              </div>
            ),
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => onChange([...pieces, { productId: "" }])}
        className="text-xs font-bold tracking-wider uppercase border border-gray-300 px-3 py-1.5 hover:border-black transition-colors"
      >
        + Thêm món lẻ
      </button>
      <p className="text-[11px] text-gray-400 mt-1">
        Món lẻ link tới sản phẩm riêng: giá, size và hết hàng lấy từ sản
        phẩm đó. Muốn bán lẻ món chưa có sản phẩm riêng thì thêm sản phẩm
        đó trước rồi quay lại link.
      </p>
    </div>
  );
}
