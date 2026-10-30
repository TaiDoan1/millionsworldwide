/**
 * Pure settings validation — no Next.js imports, so it can be unit-tested
 * outside the app. Returns an error message, or null when the settings
 * object is safe to persist.
 */
import type { Settings } from "../storage/types";

const BANNER_SIZES = ["full", "large", "medium"];
const TEXT_COLORS = ["white", "black"];

export function validateSettings(s: Settings): string | null {
  if (!BANNER_SIZES.includes(s.bannerSize)) {
    return "Kích thước banner chưa đúng.";
  }
  if (!TEXT_COLORS.includes(s.textColor)) {
    return "Màu chữ chưa đúng.";
  }
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
  return null;
}
