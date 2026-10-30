import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CollectionHeader from "../../components/CollectionHeader";
import CollectionFooter from "../../components/CollectionFooter";
import { CartProvider } from "../../components/CartContext";
import CartDrawer from "../../components/CartDrawer";
import ProductDetail from "../../components/ProductDetail";
import { getProductById, getProducts } from "../../actions/products";
import { getSettings } from "../../actions/settings";

/**
 * Same font as the shop page: the reference shop renders in "Swiss", and
 * Inter is its closest free metric match.
 */
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// No generateStaticParams on purpose: the catalog lives in Postgres now,
// so detail pages render from the live catalog (an admin price/name edit
// shows up here without a rebuild).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
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
  const [product, products, settings] = await Promise.all([
    getProductById(id),
    getProducts(),
    getSettings(),
  ]);
  if (!product) notFound();

  // Style-with picks: same category first, then other categories, up to 4.
  const styleWith = [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 4);

  // The promo strip is 30px tall; when it shows, the floating header and
  // the content below it both shift down by exactly that much.
  const promoBar =
    settings.promoEnabled === true &&
    (settings.promoText ?? "").trim().length > 0;

  return (
    <CartProvider products={products}>
      <div className={`min-h-screen bg-white text-black ${inter.className}`}>
        <CollectionHeader products={products} promoBar={promoBar} />
        <CartDrawer />

        <main className={`w-full px-0 sm:px-[44px] ${promoBar ? "pt-[140px] sm:pt-[136px]" : "pt-[110px] sm:pt-[106px]"}`}>
          <ProductDetail product={product} styleWith={styleWith} />
        </main>

        <div className="mt-16">
          <CollectionFooter />
        </div>
      </div>
    </CartProvider>
  );
}
