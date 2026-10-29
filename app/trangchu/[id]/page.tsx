import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CollectionHeader from "../../components/CollectionHeader";
import CollectionFooter from "../../components/CollectionFooter";
import { CartProvider } from "../../components/CartContext";
import CartDrawer from "../../components/CartDrawer";
import ProductDetail from "../../components/ProductDetail";
import { PRODUCTS } from "../../data/products";

/**
 * Same font as the shop page: the reference shop renders in "Swiss", and
 * Inter is its closest free metric match.
 */
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return { title: "Không tìm thấy — millions worldwide™" };
  return {
    title: `${product.name} — millions worldwide™`,
    openGraph: {
      title: `${product.name} — millions worldwide™`,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  // Style-with picks: same category first, then other categories, up to 4.
  const styleWith = [
    ...PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category),
    ...PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 4);

  return (
    <CartProvider>
      <div className={`min-h-screen bg-white text-black ${inter.className}`}>
        <CollectionHeader />
        <CartDrawer />

        <main className="w-full px-0 pt-[110px] sm:px-[44px] sm:pt-[106px]">
          <ProductDetail product={product} styleWith={styleWith} />
        </main>

        <div className="mt-16">
          <CollectionFooter />
        </div>
      </div>
    </CartProvider>
  );
}
