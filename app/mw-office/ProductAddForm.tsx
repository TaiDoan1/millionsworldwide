"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct, type NewProduct, type Product } from "../actions/products";
import {
  isLinkedPiece,
  type ProductCategory,
  type ProductPiece,
  type SizeOption,
} from "../data/products";
import SizesEditor from "./SizesEditor";
import PiecesEditor from "./PiecesEditor";
import ImageUpload from "./ImageUpload";

/**
 * Add-product form on the admin page. Images are text paths that must
 * already exist in public/ (the server refuses the save otherwise) —
 * uploading brand-new image files still happens through code.
 */
export default function ProductAddForm({
  products,
  categories,
}: {
  /** All products, for the "món lẻ" link dropdown. */
  products: Product[];
  /** Live categories, for the category dropdown. */
  categories: ProductCategory[];
}) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [compareAt, setCompareAt] = useState("");
  const [category, setCategory] = useState<string>(
    categories[0]?.slug ?? "sets",
  );
  const [images, setImages] = useState("");
  const [soldOut, setSoldOut] = useState(false);
  const [preOrder, setPreOrder] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [pieces, setPieces] = useState<ProductPiece[]>([]);
  const [sizeChart, setSizeChart] = useState("");
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
      pieces: pieces
        .map((pc) =>
          isLinkedPiece(pc)
            ? { productId: pc.productId.trim() }
            : {
                id: (pc.id ?? "").trim().toLowerCase(),
                name: (pc.name ?? "").trim(),
                price: pc.price,
              },
        )
        .filter((pc) =>
          isLinkedPiece(pc)
            ? pc.productId.length > 0
            : (pc.name?.length ?? 0) > 0,
        ),
      sizeChart: sizeChart.trim() === "" ? null : sizeChart.trim(),
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
      setPieces([]);
      setSizeChart("");
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
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputClass} bg-white`}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase mb-1 text-gray-600">
          Ảnh (mỗi dòng 1 đường dẫn, ảnh đầu là ảnh chính)
        </label>
        <ImageUpload
          onUploaded={(url) =>
            setImages((prev) =>
              prev.trim() ? `${prev.trim()}\n${url}` : url,
            )
          }
        />
        <textarea
          value={images}
          onChange={(e) => setImages(e.target.value)}
          placeholder={"/products/set-hoodie-black-1.jpg"}
          rows={3}
          className={`${inputClass} font-mono text-xs mt-2`}
        />
        <p className="text-[11px] text-gray-400 mt-1">
          Ảnh tải lên ở trên sẽ tự thêm đường dẫn vào đây. Ảnh có sẵn
          trong web thì ghi đường dẫn tay — ghi sai đường dẫn thì không
          lưu được.
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
      <PiecesEditor
        pieces={pieces}
        products={products}
        ownId={id}
        onChange={setPieces}
      />
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase mb-1 text-gray-600">
          Bảng size (ảnh, không bắt buộc)
        </label>
        <ImageUpload onUploaded={(url) => setSizeChart(url)} />
        {sizeChart && (
          <p className="text-xs text-gray-500 mt-1">
            Đã up: <span className="font-mono break-all">{sizeChart}</span>
          </p>
        )}
      </div>
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
