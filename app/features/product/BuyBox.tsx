import type { Product } from "../../data/products";
import { formatPrice } from "../../lib/format";
import { EASE, TAG_BY_CATEGORY } from "./constants";

/** Sticky buy column: tag, name, price, size note, add button, shipping note. */
export default function BuyBox({
  product,
  added,
  onAdd,
}: {
  product: Product;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <div>
      <span className="text-sm font-bold lowercase text-black">
        {TAG_BY_CATEGORY[product.category]}
      </span>
      <h1 className="mt-2 text-3xl font-bold uppercase leading-tight sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-3 text-xl font-bold">
        {product.compareAt && (
          <span className="mr-2 font-medium text-neutral-400 line-through">
            {formatPrice(product.compareAt)}
          </span>
        )}
        {formatPrice(product.price)}
      </p>
      {product.preOrder && (
        <p className="mt-2 inline-block bg-[#666] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          Pre-order
        </p>
      )}

      {/* Size note — the shop confirms size by phone, so no size
          picker is invented here; the note keeps the flow honest. */}
      <div className="mt-6 rounded-[12px] bg-[#f5f5f5] p-4">
        <p className="text-sm font-semibold uppercase tracking-wider">
          Size
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#67645e]">
          Shop sẽ xác nhận size khi gọi xác nhận đơn. Bạn có thể ghi chú
          size mình mặc ở bước đặt hàng.
        </p>
      </div>

      <button
        type="button"
        disabled={product.soldOut}
        onClick={onAdd}
        className={`mt-6 h-[50px] w-full rounded-full bg-black text-[max(0.875rem,0.925vw)] uppercase text-white transition-opacity duration-700 ${EASE} hover:opacity-80 disabled:cursor-not-allowed disabled:bg-neutral-400`}
      >
        {product.soldOut ? "Sold Out" : added ? "Đã thêm ✓" : "Thêm vào giỏ"}
      </button>
      <p className="mt-3 text-center text-sm text-[#67645e]">
        Miễn phí vận chuyển toàn quốc • Shop xử lý đơn trong 1–2 ngày,
        giao hàng trong 3–5 ngày.
      </p>
    </div>
  );
}
