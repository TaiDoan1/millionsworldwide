import Image from "next/image";
import type { Product } from "../data/products";

function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const save = product.compareAt ? product.compareAt - product.price : 0;
  const savePct = product.compareAt
    ? Math.round((save / product.compareAt) * 100)
    : 0;

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        {product.soldOut && (
          <span className="absolute right-0 bottom-8 bg-black px-3 py-1.5 text-xs font-medium text-white">
            sold out
          </span>
        )}
        {product.preOrder && !product.soldOut && (
          <span className="absolute right-0 bottom-8 bg-black px-3 py-1.5 text-xs font-medium text-white">
            pre-order
          </span>
        )}
        {save > 0 && !product.soldOut && (
          <span className="absolute right-0 bottom-8 bg-black px-3 py-1.5 text-xs font-medium text-white">
            save {formatPrice(save)} (-{savePct}%)
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-center">
        <h3 className="text-base">{product.name}</h3>
        <div className="mt-1 text-sm">
          {product.compareAt && (
            <span className="mr-2 text-neutral-400 line-through">
              {formatPrice(product.compareAt)}
            </span>
          )}
          <span>{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
}
