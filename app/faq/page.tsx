import FaqSection from "../components/FaqSection";
import SiteFooter from "../components/SiteFooter";

export const metadata = { title: "faq — millions worldwide™" };

export default function FaqPage() {
  return (
    <>
      <main className="w-full pb-24 pt-16">
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
