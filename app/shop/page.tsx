import AnnouncementBar from "../components/AnnouncementBar";
import SiteHeader from "../components/SiteHeader";
import ShopSection from "../components/ShopSection";
import InstagramSection from "../components/InstagramSection";
import FaqSection from "../components/FaqSection";
import SiteFooter from "../components/SiteFooter";

export const metadata = {
  title: "shop — millions worldwide™",
};

export default function ShopPage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <ShopSection />
      <InstagramSection />
      <FaqSection />
      <SiteFooter />
    </>
  );
}
