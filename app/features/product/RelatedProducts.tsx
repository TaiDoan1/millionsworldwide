import type { Product } from "../../data/products";
import ProductCard from "../../components/ProductCard";

/** "Phối cùng" — cross-sell block, same cards as the shop grid. */
export default function RelatedProducts({
  products,
  name,
}: {
  products: Product[];
  name: string;
}) {
  if (products.length === 0) return null;
  return (
    <section
      className="mw-fade-up mt-16 px-4 sm:px-0"
      style={{ animationDelay: "240ms" }}
    >
      <h2 className="text-2xl font-bold uppercase">Phối cùng</h2>
      <p className="mt-1 text-sm text-[#67645e]">
        Gợi ý mặc cùng {name}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} cols={2} />
        ))}
      </div>
    </section>
  );
}
