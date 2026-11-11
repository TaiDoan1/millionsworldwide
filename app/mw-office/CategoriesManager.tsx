"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addCategory,
  deleteCategory,
  updateCategory,
  type ProductCategory,
} from "../actions/categories";

/** URL-safe slug from a label: "Áo Hoodie" → "ao-hoodie". */
function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/đ/g, "d") // NFD does not decompose đ, so map it by hand.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Row = ProductCategory & { sortOrder: number };

/**
 * Category manager: rename labels, reorder with ↑ ↓, add new ones,
 * delete empty ones. One "Lưu thay đổi" saves every label/order edit;
 * adds and deletes apply immediately (with confirm for deletes).
 */
export default function CategoriesManager({
  categories,
  counts,
}: {
  categories: ProductCategory[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  // Display order is the stored order; the index is the working
  // sortOrder (the server stores whatever order we save). The parent
  // remounts this component (via `key`) whenever the saved list
  // changes, so the local list always starts from the saved one.
  const toRows = (cats: ProductCategory[]): Row[] =>
    cats.map((c, i) => ({ ...c, sortOrder: i }));
  const [list, setList] = useState<Row[]>(() => toRows(categories));
  const [newLabel, setNewLabel] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function move(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const a = next[index];
    const b = next[to];
    next[index] = { ...a, sortOrder: b.sortOrder };
    next[to] = { ...b, sortOrder: a.sortOrder };
    next.sort((x, y) => x.sortOrder - y.sortOrder);
    setList(next);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    // Save every row's label + order (re-saving an unchanged row is
    // harmless) so no diff tracking is needed.
    for (const row of list) {
      const result = await updateCategory(row.slug, {
        label: row.label,
        sortOrder: row.sortOrder,
      });
      if (!result.success) {
        setMessage(result.error ?? "Không lưu được danh mục.");
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setMessage("Đã lưu danh mục.");
    router.refresh();
  }

  async function handleAdd() {
    if (newLabel.trim() === "" || newSlug.trim() === "") {
      setMessage("Ghi tên và mã danh mục rồi hãy thêm.");
      return;
    }
    setSaving(true);
    setMessage("");
    const result = await addCategory({
      slug: newSlug.trim().toLowerCase(),
      label: newLabel.trim(),
    });
    setSaving(false);
    if (result.success) {
      setMessage("Đã thêm danh mục.");
      setNewLabel("");
      setNewSlug("");
      setSlugTouched(false);
      router.refresh();
    } else {
      setMessage(result.error ?? "Không thêm được danh mục.");
    }
  }

  async function handleDelete(slug: string, label: string) {
    const count = counts[slug] ?? 0;
    if (count > 0) {
      setMessage(
        `Còn ${count} sản phẩm đang dùng danh mục "${label}", chuyển chúng sang danh mục khác rồi hãy xóa nhé.`,
      );
      return;
    }
    if (!window.confirm(`Xóa danh mục "${label}"?`)) return;
    setSaving(true);
    setMessage("");
    const result = await deleteCategory(slug);
    setSaving(false);
    if (result.success) {
      setMessage("Đã xóa danh mục.");
      router.refresh();
    } else {
      setMessage(result.error ?? "Không xóa được danh mục.");
    }
  }

  const inputClass =
    "border border-gray-300 p-2 text-sm rounded-sm focus:outline-none focus:border-black";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {list.map((row, i) => (
          <div key={row.slug} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={row.label}
              onChange={(e) =>
                setList(
                  list.map((r, j) =>
                    j === i ? { ...r, label: e.target.value } : r,
                  ),
                )
              }
              maxLength={50}
              aria-label={`Tên danh mục ${row.slug}`}
              className={`${inputClass} w-44`}
            />
            <span className="font-mono text-xs text-gray-500">{row.slug}</span>
            <span className="text-xs text-gray-400">
              {counts[row.slug] ?? 0} sản phẩm
            </span>
            <span className="flex gap-1">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                aria-label={`Đưa ${row.label} lên trước`}
                className="px-2 py-1 text-sm font-bold text-gray-600 hover:text-black disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={i === list.length - 1}
                onClick={() => move(i, 1)}
                aria-label={`Đưa ${row.label} xuống sau`}
                className="px-2 py-1 text-sm font-bold text-gray-600 hover:text-black disabled:opacity-30"
              >
                ↓
              </button>
            </span>
            <button
              type="button"
              onClick={() => handleDelete(row.slug, row.label)}
              aria-label={`Xóa danh mục ${row.label}`}
              className="text-gray-400 hover:text-black text-lg leading-none px-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="w-fit text-xs font-bold tracking-wider uppercase bg-black text-white px-4 py-2 hover:opacity-80 disabled:opacity-50 transition-opacity"
      >
        {saving ? "Đang lưu…" : "Lưu thay đổi"}
      </button>

      <div className="border-t border-neutral-200 pt-4 mt-2">
        <p className="text-xs font-semibold tracking-wider uppercase mb-2 text-gray-600">
          Thêm danh mục mới
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => {
              setNewLabel(e.target.value);
              if (!slugTouched) setNewSlug(slugify(e.target.value));
            }}
            placeholder="Tên danh mục (VD: Hoodies)"
            maxLength={50}
            className={`${inputClass} w-44`}
          />
          <input
            type="text"
            value={newSlug}
            onChange={(e) => {
              setNewSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="Mã: hoodies"
            maxLength={50}
            className={`${inputClass} w-44 font-mono text-xs`}
          />
          <button
            type="button"
            disabled={saving}
            onClick={handleAdd}
            className="text-xs font-bold tracking-wider uppercase border border-gray-300 px-3 py-1.5 hover:border-black transition-colors disabled:opacity-50"
          >
            + Thêm danh mục
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
