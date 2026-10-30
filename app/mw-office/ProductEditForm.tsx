"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProduct,
  updateProduct,
  type Product,
  type ProductPatch,
} from "../actions/products";
import { CATEGORIES, type SizeOption } from "../data/products";
import SizesEditor from "./SizesEditor";

const CATEGORY_LABELS: Record<Product["category"], string> = {
  sets: "Sets",
  "t-shirts": "T-Shirts",
  shirts: "Shirts",
  jeans: "Jeans",
  shorts: "Shorts",
};

/** Per-product edit form on the admin page (admin only, server-checked). */
export default function ProductEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [compareAt, setCompareAt] = useState(
    product.compareAt ? String(product.compareAt) : "",
  );
  const [category, setCategory] = useState<Product["category"]>(product.category);
  const [soldOut, setSoldOut] = useState(product.soldOut ?? false);
  const [preOrder, setPreOrder] = useState(product.preOrder ?? false);
  const [hidden, setHidden] = useState(product.hidden ?? false);
  const [sizes, setSizes] = useState<SizeOption[]>(product.sizes ?? []);
  const [material, setMaterial] = useState(product.spec?.material ?? "");
  const [fit, setFit] = useState(product.spec?.fit ?? "");
  const [stretch, setStretch] = useState(product.spec?.stretch ?? "");
  const [model, setModel] = useState(product.spec?.model ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function buildPatch(): ProductPatch {
    return {
      name,
      price: Number(price),
      compareAt: compareAt.trim() === "" ? null : Number(compareAt),
      category,
      soldOut,
      preOrder,
      hidden,
      sizes: sizes
        .map((s) => ({
          label: s.label.trim(),
          ...(s.soldOut ? { soldOut: true } : {}),
        }))
        .filter((s) => s.label.length > 0),
      spec:
        material.trim() || fit.trim() || stretch.trim() || model.trim()
          ? {
              ...(material.trim() ? { material: material.trim() } : {}),
              ...(fit.trim() ? { fit: fit.trim() } : {}),
              ...(stretch.trim() ? { stretch: stretch.trim() } : {}),
              ...(model.trim() ? { model: model.trim() } : {}),
            }
          : null,
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const result = await updateProduct(product.id, buildPatch());
    setSaving(false);
    if (result.success) {
      setMessage("Đã lưu.");
      router.refresh();
    } else {
      setMessage(result.error ?? "Không lưu được.");
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Xóa sản phẩm "${product.name}"? Đơn cũ vẫn giữ nguyên, nhưng sản phẩm sẽ biến mất khỏi shop.`,
      )
    ) {
      return;
    }
    setSaving(true);
    setMessage("");
    const result = await deleteProduct(product.id);
    setSaving(false);
    if (result.success) {
      setMessage("Đã xóa.");
      router.refresh();
    } else {
      setMessage(result.error ?? "Không xóa được.");
    }
  }

  const inputClass =
    "w-full border border-gray-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-black";

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase mb-1 text-gray-600">
          Tên sản phẩm
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold tracking-wider uppercase mb-1 text-gray-600">
            Giá (nghìn đồng)
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Ví dụ: 890 = 890.000₫.
          </p>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold tracking-wider uppercase mb-1 text-gray-600">
            Giá gốc (không bắt buộc)
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            placeholder="Để trống nếu không giảm giá"
            className={inputClass}
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Hiện gạch ngang kèm giá bán.
          </p>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold tracking-wider uppercase mb-1 text-gray-600">
            Danh mục
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Product["category"])}
            className={`${inputClass} bg-white`}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={soldOut}
            onChange={(e) => setSoldOut(e.target.checked)}
            className="w-4 h-4 accent-black"
          />
          Hết hàng (badge SOLD OUT, khách không đặt được)
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={preOrder}
            onChange={(e) => setPreOrder(e.target.checked)}
            className="w-4 h-4 accent-black"
          />
          Cho đặt trước
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => setHidden(e.target.checked)}
            className="w-4 h-4 accent-black"
          />
          Ẩn khỏi shop
        </label>
      </div>
      <SizesEditor sizes={sizes} onChange={setSizes} />
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
          Thông số (chỉ hiện dòng nào có ghi)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Chất liệu (VD: Cotton 100%)"
            maxLength={200}
            className={inputClass}
          />
          <input
            type="text"
            value={fit}
            onChange={(e) => setFit(e.target.value)}
            placeholder="Phom dáng (VD: Oversize)"
            maxLength={200}
            className={inputClass}
          />
          <input
            type="text"
            value={stretch}
            onChange={(e) => setStretch(e.target.value)}
            placeholder="Co giãn (VD: Không co giãn)"
            maxLength={200}
            className={inputClass}
          />
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Người mẫu (VD: Cao 1m80, mặc size M)"
            maxLength={200}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving ? "Đang lưu…" : "Lưu sản phẩm"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="text-xs font-bold tracking-widest uppercase text-red-700 hover:text-red-900 disabled:opacity-50 px-2 py-2.5"
        >
          Xóa sản phẩm
        </button>
        <span className="text-xs text-gray-500">{message}</span>
      </div>
    </form>
  );
}
