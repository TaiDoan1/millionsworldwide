"use client";

import type { Product } from "../actions/products";
import type { ProductCategory } from "../data/products";
import {
  checkboxClass,
  FieldLabel,
  Hint,
  inputClass,
  selectClass,
} from "./ui";
import SizesEditor from "./SizesEditor";
import ColorsEditor from "./ColorsEditor";
import PiecesEditor from "./PiecesEditor";
import type { ProductFormValues } from "./product-form";

/**
 * The fields the add and edit product forms share: prices, category,
 * the three toggles, sizes and linked pieces. The two forms keep only
 * what differs (name/id layout, images, spec, save/delete buttons).
 */
export default function ProductFormFields({
  values,
  onChange,
  products,
  categories,
  ownId,
  showPriceHints,
  verboseCheckboxes,
}: {
  values: ProductFormValues;
  onChange: (patch: Partial<ProductFormValues>) => void;
  /** All products, for the "món lẻ" link dropdown. */
  products: Product[];
  /** Live categories, for the category dropdown. */
  categories: ProductCategory[];
  /** The product being edited (its own id is excluded from links). */
  ownId: string;
  /** Edit form shows the price hints; add form does not. */
  showPriceHints?: boolean;
  /** Edit form spells out what "Hết hàng" does; add form keeps it short. */
  verboseCheckboxes?: boolean;
}) {
  return (
    <>
      <div className="flex gap-3">
        <div className="flex-1">
          <FieldLabel>Giá (nghìn đồng)</FieldLabel>
          <input
            type="number"
            min={1}
            step={1}
            value={values.price}
            onChange={(e) => onChange({ price: e.target.value })}
            className={inputClass}
          />
          {showPriceHints && <Hint>Ví dụ: 890 = 890.000₫.</Hint>}
        </div>
        <div className="flex-1">
          <FieldLabel>Giá gốc (không bắt buộc)</FieldLabel>
          <input
            type="number"
            min={1}
            step={1}
            value={values.compareAt}
            onChange={(e) => onChange({ compareAt: e.target.value })}
            placeholder={
              showPriceHints ? "Để trống nếu không giảm giá" : undefined
            }
            className={inputClass}
          />
          {showPriceHints && <Hint>Hiện gạch ngang kèm giá bán.</Hint>}
        </div>
        <div className="flex-1">
          <FieldLabel>Danh mục</FieldLabel>
          <select
            value={values.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className={selectClass}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={values.soldOut}
            onChange={(e) => onChange({ soldOut: e.target.checked })}
            className={checkboxClass}
          />
          {verboseCheckboxes
            ? "Hết hàng (badge SOLD OUT, khách không đặt được)"
            : "Hết hàng"}
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={values.preOrder}
            onChange={(e) => onChange({ preOrder: e.target.checked })}
            className={checkboxClass}
          />
          Cho đặt trước
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={values.hidden}
            onChange={(e) => onChange({ hidden: e.target.checked })}
            className={checkboxClass}
          />
          Ẩn khỏi shop
        </label>
      </div>
      <SizesEditor
        sizes={values.sizes}
        onChange={(sizes) => onChange({ sizes })}
      />
      <ColorsEditor
        colors={values.colors}
        onChange={(colors) => onChange({ colors })}
      />
      <PiecesEditor
        pieces={values.pieces}
        products={products}
        ownId={ownId}
        onChange={(pieces) => onChange({ pieces })}
      />
    </>
  );
}
