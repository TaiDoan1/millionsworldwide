"use client";

import { useState } from "react";
import { addProduct, type Product } from "../actions/products";
import { type ProductCategory } from "../data/products";
import ImageUpload from "./ImageUpload";
import ProductFormFields from "./ProductFormFields";
import {
  buildNewProduct,
  emptyProductFormValues,
  type ProductFormValues,
} from "./product-form";
import { FieldLabel, Hint, inputClass, messageClass, SaveButton } from "./ui";
import { useAdminSave } from "./ui-client";

/**
 * Add-product form on the admin page. Images are paths, one per line —
 * uploaded with the control above, or typed by hand for photos already
 * in the web (the server refuses the save for paths with no file).
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
  const [id, setId] = useState("");
  const [values, setValues] = useState<ProductFormValues>(() =>
    emptyProductFormValues(categories),
  );
  const patch = (p: Partial<ProductFormValues>) =>
    setValues((v) => ({ ...v, ...p }));
  const [images, setImages] = useState("");
  const { saving, message, save } = useAdminSave();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const imageList = images
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const ok = await save(
      () => addProduct(buildNewProduct(values, id, imageList)),
      "Đã thêm sản phẩm.",
    );
    if (ok) {
      setId("");
      setImages("");
      // Category and toggles stay as-is; only the filled-in fields reset.
      patch({
        name: "",
        price: "",
        compareAt: "",
        sizes: [],
        pieces: [],
        sizeChart: "",
      });
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <FieldLabel>Mã sản phẩm (đường dẫn)</FieldLabel>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="VD: tee-millions-2"
            className={inputClass}
          />
          <Hint>Chỉ chữ thường, số, gạch ngang. Không đổi được sau khi thêm.</Hint>
        </div>
        <div className="flex-1">
          <FieldLabel>Tên sản phẩm</FieldLabel>
          <input
            type="text"
            value={values.name}
            onChange={(e) => patch({ name: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <ProductFormFields
        values={values}
        onChange={patch}
        products={products}
        categories={categories}
        ownId={id}
      />
      <div>
        <FieldLabel>Ảnh (mỗi dòng 1 đường dẫn, ảnh đầu là ảnh chính)</FieldLabel>
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
        <Hint>
          Ảnh tải lên ở trên sẽ tự thêm đường dẫn vào đây. Ảnh có sẵn
          trong web thì ghi đường dẫn tay — ghi sai đường dẫn thì không
          lưu được.
        </Hint>
      </div>
      <div>
        <FieldLabel>Bảng size (ảnh, không bắt buộc)</FieldLabel>
        <ImageUpload onUploaded={(url) => patch({ sizeChart: url })} />
        {values.sizeChart && (
          <p className="text-xs text-gray-500 mt-1">
            Đã up:{" "}
            <span className="font-mono break-all">{values.sizeChart}</span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <SaveButton saving={saving} savingLabel="Đang thêm…">
          Thêm sản phẩm
        </SaveButton>
        <span className={messageClass}>{message}</span>
      </div>
    </form>
  );
}
