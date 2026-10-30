/**
 * Pure settings validation — no Next.js imports, so it can be unit-tested
 * outside the app. Returns an error message, or null when the settings
 * object is safe to persist.
 */
import type { Settings } from "../storage/types";

export function validateSettings(s: Settings): string | null {
  if (typeof s.comingSoonEnabled !== "boolean") {
    return "Trạng thái Coming Soon chưa đúng.";
  }
  if (
    typeof s.launchDate !== "string" ||
    Number.isNaN(Date.parse(s.launchDate))
  ) {
    return "Ngày mở web chưa đúng định dạng.";
  }
  if (
    s.comingSoonTitle !== undefined &&
    (typeof s.comingSoonTitle !== "string" || s.comingSoonTitle.length > 200)
  ) {
    return "Tiêu đề quá dài.";
  }
  if (
    s.comingSoonSubtitle !== undefined &&
    (typeof s.comingSoonSubtitle !== "string" ||
      s.comingSoonSubtitle.length > 500)
  ) {
    return "Phụ đề quá dài.";
  }
  if (s.promoEnabled !== undefined && typeof s.promoEnabled !== "boolean") {
    return "Trạng thái banner khuyến mãi chưa đúng.";
  }
  if (
    s.promoText !== undefined &&
    (typeof s.promoText !== "string" || s.promoText.length > 200)
  ) {
    return "Nội dung banner khuyến mãi quá dài.";
  }
  if (
    s.promoLink !== undefined &&
    s.promoLink !== "" &&
    (typeof s.promoLink !== "string" || !s.promoLink.startsWith("/"))
  ) {
    return "Link banner khuyến mãi phải là đường dẫn trong web (bắt đầu bằng /).";
  }
  if (
    s.marqueeText !== undefined &&
    (typeof s.marqueeText !== "string" || s.marqueeText.length > 2000)
  ) {
    return "Chữ chạy trang chủ quá dài.";
  }
  if (
    s.editorialHeading !== undefined &&
    (typeof s.editorialHeading !== "string" ||
      s.editorialHeading.length > 200)
  ) {
    return "Tiêu đề editorial quá dài.";
  }
  if (
    s.editorialText !== undefined &&
    (typeof s.editorialText !== "string" || s.editorialText.length > 1000)
  ) {
    return "Đoạn editorial quá dài.";
  }
  return null;
}
