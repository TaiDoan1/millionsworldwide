import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CollectionHeader from "../../components/CollectionHeader";
import CollectionFooter from "../../components/CollectionFooter";
import ProductDetail from "../../components/ProductDetail";
import { getProductById, getProducts } from "../../actions/products";
import { getCategories } from "../../actions/categories";
import { getSettings } from "../../actions/settings";
import { getSiteUrl } from "../../lib/site-url";
import {
  DEFAULT_DESCRIPTION,
  DESCRIPTION_BY_CATEGORY,
} from "../../features/product/constants";

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
    alternates: {
      canonical: `/trangchu/${id}`,
    },
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
  const [product, products, categories, settings] = await Promise.all([
    getProductById(id),
    getProducts(),
    getCategories(),
    getSettings(),
  ]);
  if (!product) notFound();

  // Style-with picks: same category first, then other categories, up to 4.
  const styleWith = [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 4);

  // Structured data for Google: the product itself (name, photos, price
  // in VND, stock) plus the breadcrumb trail home → shop → product.
  const siteUrl = getSiteUrl();
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((src) => `${siteUrl}${src}`),
    description:
      DESCRIPTION_BY_CATEGORY[product.category] ?? DEFAULT_DESCRIPTION,
    brand: { "@type": "Brand", name: "MILLIONS WORLDWIDE" },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/trangchu/${product.id}`,
      priceCurrency: "VND",
      price: product.price * 1000,
      availability: product.soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${siteUrl}/trangchu`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${siteUrl}/trangchu/${product.id}`,
      },
    ],
  };

  // The promo strip is 30px tall; when it shows, the floating header and
  // the content below it both shift down by exactly that much.
  const promoBar =
    settings.promoEnabled === true &&
    (settings.promoText ?? "").trim().length > 0;

  return (
    <div className={`min-h-screen bg-white text-black ${inter.className}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CollectionHeader products={products} categories={categories} promoBar={promoBar} />

      <main className={`w-full px-0 sm:px-[44px] ${promoBar ? "pt-[140px] sm:pt-[136px]" : "pt-[110px] sm:pt-[106px]"}`}>
        <ProductDetail product={product} styleWith={styleWith} catalog={products} />
      </main>

      <div className="mt-16">
        <CollectionFooter whatsappUrl={settings.whatsappUrl} />
      </div>
    </div>
  );
}
