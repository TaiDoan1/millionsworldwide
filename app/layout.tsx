import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "./components/Header";
import { getSiteUrl } from "./lib/site-url";

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
  openGraph: {
    title: "MILLIONS WORLDWIDE",
    description:
      "MILLIONS WORLDWIDE — thương hiệu thời trang đường phố Việt Nam. Built for those who choose form over noise.",
    url: "/",
    siteName: "MILLIONS WORLDWIDE",
    type: "website",
    images: [
      {
        url: "/ig/banner.jpg",
        width: 1707,
        height: 2560,
        alt: "MILLIONS WORLDWIDE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MILLIONS WORLDWIDE",
    description:
      "MILLIONS WORLDWIDE — thương hiệu thời trang đường phố Việt Nam. Built for those who choose form over noise.",
    images: ["/ig/banner.jpg"],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png?v=3" />
      </head>
      <body className="min-h-full bg-white text-black">
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
