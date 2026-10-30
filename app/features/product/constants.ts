import type { Product } from "../../data/products";

/** The reference site's signature motion: 0.7s cubic-bezier(0.76, 0, 0.24, 1). */
export const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

export const TAG_BY_CATEGORY: Record<Product["category"], string> = {
  sets: "set",
  "t-shirts": "t-shirt",
  shirts: "shirt",
  jeans: "jeans",
  shorts: "shorts",
};

export const DESCRIPTION_BY_CATEGORY: Record<Product["category"], string> = {
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
