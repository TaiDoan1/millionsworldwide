"use client";

import { useState } from "react";
import {
  deleteProduct,
  updateProduct,
  type Product,
} from "../actions/products";
import { type ProductCategory } from "../data/products";
import ImageUpload from "./ImageUpload";
import ProductFormFields from "./ProductFormFields";
import {
  buildProductPatch,
  productToFormValues,
  type ProductFormValues,
} from "./product-form";
import { FieldLabel, Hint, inputClass, messageClass, SaveButton } from "./ui";
import { useAdminSave } from "./ui-client";

/** Per-product edit form on the admin page (admin only, server-checked). */
export default function ProductEditForm({
  product,
  products,
  categories,
}: {
  product: Product;
  /** All products, for the "món lẻ" link dropdown. */
  products: Product[];
  /** Live categories, for the category dropdown. */
  categories: ProductCategory[];
}) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    productToFormValues(product),
  );
  const patch = (p: Partial<ProductFormValues>) =>
    setValues((v) => ({ ...v, ...p }));
  const [images, setImages] = useState<string[]>(product.images ?? []);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  /** Move one photo to another position — the gallery shows the list
   *  in this order, first photo first. Shared by drag-and-drop and
   *  the ‹ › buttons (drag does not work on touch screens). */
  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setImages(next);
  }
  const [material, setMaterial] = useState(product.spec?.material ?? "");
  const [fit, setFit] = useState(product.spec?.fit ?? "");
  const [stretch, setStretch] = useState(product.spec?.stretch ?? "");
  const [model, setModel] = useState(product.spec?.model ?? "");
  const { saving, message, save } = useAdminSave();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await save(
      () =>
        updateProduct(
          product.id,
          buildProductPatch(
            values,
            { material, fit, stretch, model },
            images,
          ),
        ),
      "Đã lưu.",
    );
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Xóa sản phẩm "${product.name}"? Đơn cũ vẫn giữ nguyên, nhưng sản phẩm sẽ biến mất khỏi shop.`,
      )
    ) {
      return;
    }
    await save(() => deleteProduct(product.id), "Đã xóa.");
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      <div>
        <FieldLabel>Tên sản phẩm</FieldLabel>
        <input
          type="text"
          value={values.name}
          onChange={(e) => patch({ name: e.target.value })}
          className={inputClass}
        />
      </div>
      <ProductFormFields
        values={values}
        onChange={patch}
        products={products}
        categories={categories}
        ownId={product.id}
        showPriceHints
        verboseCheckboxes
      />
      <div>
        <FieldLabel mb={2}>Ảnh sản phẩm (ảnh đầu là ảnh chính)</FieldLabel>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIndex(i);
                }}
                onDrop={() => {
                  if (dragIndex !== null) moveImage(dragIndex, i);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={`relative w-20 cursor-grab active:cursor-grabbing ${
                  dragIndex === i ? "opacity-40" : ""
                } ${
                  overIndex === i && dragIndex !== null && dragIndex !== i
                    ? "ring-2 ring-black rounded-sm"
                    : ""
                }`}
              >
                {/* Plain img on purpose: uploaded photos are served by
                    the /uploads route, outside next/image's local set. */}
                <img
                  src={src}
                  alt={`Ảnh ${i + 1} của ${product.name}`}
                  className="h-24 w-20 rounded-sm border border-gray-200 object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-0 top-0 bg-black px-1 py-0.5 text-[9px] font-bold uppercase text-white">
                    Chính
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setImages(images.filter((_, j) => j !== i))
                  }
                  aria-label={`Xóa ảnh ${i + 1}`}
                  className="absolute right-0 top-0 bg-white/90 px-1 text-sm leading-none text-gray-500 hover:text-black"
                >
                  ×
                </button>
                <span className="absolute bottom-0 left-0 right-0 flex justify-between bg-white/85 px-0.5">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveImage(i, i - 1)}
                    aria-label={`Đưa ảnh ${i + 1} lên trước`}
                    className="px-1 text-sm font-bold leading-none text-gray-600 hover:text-black disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    disabled={i === images.length - 1}
                    onClick={() => moveImage(i, i + 1)}
                    aria-label={`Đưa ảnh ${i + 1} ra sau`}
                    className="px-1 text-sm font-bold leading-none text-gray-600 hover:text-black disabled:opacity-30"
                  >
                    ›
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
        <ImageUpload onUploaded={(url) => setImages([...images, url])} />
        <Hint>
          Kéo thả ảnh để xếp thứ tự hiển thị (ảnh đầu là ảnh chính); trên
          điện thoại dùng nút ‹ › dưới mỗi ảnh. Ảnh tải lên lưu vào Volume
          của web và hiện ngay sau khi bấm Lưu sản phẩm. Xóa ảnh ở đây chỉ
          gỡ khỏi sản phẩm, file vẫn còn trên web.
        </Hint>
      </div>
      <div>
        <FieldLabel mb={2}>Bảng size (ảnh)</FieldLabel>
        {values.sizeChart && (
          <div className="relative mb-3 w-40">
            {/* Plain img on purpose: the chart is served by the /uploads
                route, outside next/image's local set. */}
            <img
              src={values.sizeChart}
              alt={`Bảng size của ${product.name}`}
              className="w-40 rounded-sm border border-gray-200"
            />
            <button
              type="button"
              onClick={() => patch({ sizeChart: "" })}
              aria-label="Xóa bảng size"
              className="absolute right-0 top-0 bg-white/90 px-1 text-sm leading-none text-gray-500 hover:text-black"
            >
              ×
            </button>
          </div>
        )}
        <ImageUpload onUploaded={(url) => patch({ sizeChart: url })} />
        <Hint>
          Up ảnh bảng size (số đo từng size). Khách bấm “Xem bảng size” ở
          trang chi tiết để xem ảnh này. Để trống nếu chưa có.
        </Hint>
      </div>
      <div>
        <FieldLabel mb={2}>Thông số (chỉ hiện dòng nào có ghi)</FieldLabel>
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
        <SaveButton saving={saving} savingLabel="Đang lưu…">
          Lưu sản phẩm
        </SaveButton>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="text-xs font-bold tracking-widest uppercase text-red-700 hover:text-red-900 disabled:opacity-50 px-2 py-2.5"
        >
          Xóa sản phẩm
        </button>
        <span className={messageClass}>{message}</span>
      </div>
    </form>
  );
}
