"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct, type NewProduct, type Product } from "../actions/products";
import { CATEGORIES, type SizeOption } from "../data/products";
import SizesEditor from "./SizesEditor";

const CATEGORY_LABELS: Record<Product["category"], string> = {
  sets: "Sets",
  "t-shirts": "T-Shirts",
  shirts: "Shirts",
  jeans: "Jeans",
  shorts: "Shorts",
};

/**
 * Add-product form on the admin page. Images are text paths that must
 * already exist in public/ (the server refuses the save otherwise) —
 * uploading brand-new image files still happens through code.
 */
export default function ProductAddForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [compareAt, setCompareAt] = useState("");
  const [category, setCategory] = useState<Product["category"]>("sets");
  const [images, setImages] = useState("");
  const [soldOut, setSoldOut] = useState(false);
  const [preOrder, setPreOrder] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const payload: NewProduct = {
      id,
      name,
      price: Number(price),
      compareAt: compareAt.trim() === "" ? null : Number(compareAt),
      category,
      soldOut,
      preOrder,
      hidden,
      images: images
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      sizes: sizes
        .map((s) => ({
          label: s.label.trim(),
          ...(s.soldOut ? { soldOut: true } : {}),
        }))
        .filter((s) => s.label.length > 0),
      spec: null,
    };
    const result = await addProduct(payload);
    setSaving(false);
    if (result.success) {
      setMessage("Đã thêm sản phẩm.");
      setId("");
      setName("");
      setPrice("");
      setCompareAt("");
      setImages("");
      setSizes([]);
      router.refresh();
    } else {
      setMessage(result.error ?? "Không thêm được.");
    }
  }

  const inputClass =
    "w-full border border-gray-300 p-2.5 text-sm rounded-sm focus:outline-none focus:border-black";

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold tracking-wider uppercase mb-1 text-gray-600">
            Mã sản phẩm (đường dẫn)
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="VD: tee-millions-2"
            className={inputClass}
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Chỉ chữ thường, số, gạch ngang. Không đổi được sau khi thêm.
          </p>
        </div>
        <div className="flex-1">
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
            className={inputClass}
          />
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
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase mb-1 text-gray-600">
          Ảnh (mỗi dòng 1 đường dẫn, ảnh đầu là ảnh chính)
        </label>
        <textarea
          value={images}
          onChange={(e) => setImages(e.target.value)}
          placeholder={"/products/set-hoodie-black-1.jpg"}
          rows={3}
          className={`${inputClass} font-mono text-xs`}
        />
        <p className="text-[11px] text-gray-400 mt-1">
          File ảnh phải có sẵn trong web — ghi sai đường dẫn thì không lưu
          được. Ảnh mới vẫn cần đẩy qua code.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={soldOut}
            onChange={(e) => setSoldOut(e.target.checked)}
            className="w-4 h-4 accent-black"
          />
          Hết hàng
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
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving ? "Đang thêm…" : "Thêm sản phẩm"}
        </button>
        <span className="text-xs text-gray-500">{message}</span>
      </div>
    </form>
  );
}
