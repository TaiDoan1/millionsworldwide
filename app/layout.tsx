import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "./components/Header";
import PromoBar from "./components/PromoBar";
import FloatingContacts from "./components/FloatingContacts";
import { LanguageProvider } from "./lib/i18n";
import { CartProvider } from "./components/CartContext";
import CartDrawer from "./components/CartDrawer";
import { getSettings } from "./actions/settings";
import { getProducts } from "./actions/products";
import { getSiteUrl } from "./lib/site-url";

/**
 * Everything under this layout renders per request, on purpose: the
 * product catalog and the promo strip are edited in /mw-office and must
 * apply immediately. Without this, Next would prerender pages at build
 * time with the build-time catalog/settings baked in, and an admin price
 * edit or promo change would not show until the next deploy.
 */
export const dynamic = "force-dynamic";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "MILLIONS WORLDWIDE",
  description:
    "MILLIONS WORLDWIDE — thương hiệu thời trang đường phố Việt Nam. Built for those who choose form over noise.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MILLIONS WORLDWIDE",
    description:
      "MILLIONS WORLDWIDE — thương hiệu thời trang đường phố Việt Nam. Built for those who choose form over noise.",
    url: "/",
    siteName: "MILLIONS WORLDWIDE",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "MILLIONS WORLDWIDE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MILLIONS WORLDWIDE",
    description:
      "MILLIONS WORLDWIDE — thương hiệu thời trang đường phố Việt Nam. Built for those who choose form over noise.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=3", type: "image/png" },
      { url: "/favicon.ico?v=3", type: "image/x-icon" },
    ],
    shortcut: "/favicon.png?v=3",
    apple: "/favicon.png?v=3",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Settings are read here (not just on the homepage) because the promo
  // strip and the header offset below it are site-wide. Every route reads
  // fresh per request, so a promo edit in /mw-office applies immediately.
  // The cart lives here too, so the Bag button opens it from any page —
  // the shop pages used to own their own cart each.
  const [settings, products] = await Promise.all([
    getSettings(),
    getProducts(),
  ]);
  const promoVisible =
    settings.promoEnabled === true &&
    (settings.promoText ?? "").trim().length > 0;
  const siteUrl = getSiteUrl();
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MILLIONS WORLDWIDE",
    url: siteUrl,
    logo: `${siteUrl}/favicon.png`,
    sameAs: [
      "https://www.facebook.com/share/14sNnRXMaZJ/?mibextid=wwXIfr",
      "https://www.instagram.com/millions.worldwide",
    ],
  };

  return (
    <html lang="vi" className={`${archivo.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png?v=3" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className="min-h-full bg-white text-black">
        <LanguageProvider>
          <CartProvider products={products}>
            <PromoBar
              enabled={settings.promoEnabled ?? false}
              text={settings.promoText ?? ""}
              link={settings.promoLink ?? ""}
            />
            <Header promoVisible={promoVisible} />
            {children}
            <CartDrawer />
            <FloatingContacts whatsappUrl={settings.whatsappUrl} />
            <Analytics />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
