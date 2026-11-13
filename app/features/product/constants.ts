/** The reference site's signature motion: 0.7s cubic-bezier(0.76, 0, 0.24, 1). */
export const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

export const TAG_BY_CATEGORY: Record<string, string> = {
  sets: "set",
  "t-shirts": "t-shirt",
  shirts: "shirt",
  jeans: "jeans",
  shorts: "shorts",
};

/** Generic description for a category without a custom one. */
export const DEFAULT_DESCRIPTION =
  "Sản phẩm trong bộ lookbook của Millions. Ảnh sản phẩm là ảnh thật từ buổi chụp của shop.";

export const DESCRIPTION_BY_CATEGORY: Record<string, string> = {
  sets: "Set phối sẵn gồm áo và quần — mặc nguyên bộ là đủ outfit. Ảnh sản phẩm chụp từ bộ lookbook của Millions.",
  "t-shirts":
    "Áo thun trong bộ lookbook của Millions. Ảnh sản phẩm là ảnh thật từ buổi chụp của shop.",
  shirts:
    "Áo sơ mi / khoác trong bộ lookbook của Millions. Ảnh sản phẩm là ảnh thật từ buổi chụp của shop.",
  jeans:
    "Quần jeans ống rộng trong bộ lookbook của Millions. Ảnh sản phẩm là ảnh thật từ buổi chụp của shop.",
  shorts:
    "Quần shorts trong bộ lookbook của Millions. Ảnh sản phẩm là ảnh thật từ buổi chụp của shop.",
};

/** English versions of the same descriptions (see i18n: policy pages stay Vietnamese). */
export const DEFAULT_DESCRIPTION_EN =
  "A piece from the Millions lookbook. Product photos are real shots from the shop's own shoot.";

export const DESCRIPTION_BY_CATEGORY_EN: Record<string, string> = {
  sets: "A ready-styled set — top and bottom, a full outfit as-is. Product photos are from the Millions lookbook shoot.",
  "t-shirts":
    "A tee from the Millions lookbook. Product photos are real shots from the shop's own shoot.",
  shirts:
    "A shirt / jacket from the Millions lookbook. Product photos are real shots from the shop's own shoot.",
  jeans:
    "Wide-leg jeans from the Millions lookbook. Product photos are real shots from the shop's own shoot.",
  shorts:
    "Shorts from the Millions lookbook. Product photos are real shots from the shop's own shoot.",
};
