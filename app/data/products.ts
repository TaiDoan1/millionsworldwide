export type Category = "sets" | "t-shirts" | "shirts" | "jeans" | "shorts";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
  /** Gallery — the arrows on a product card cycle through these images. */
  images: string[];
  soldOut?: boolean;
  preOrder?: boolean;
  /** Original price — set to show a "save" badge. */
  compareAt?: number;
};

export const CATEGORIES: Category[] = ["sets", "t-shirts", "shirts", "jeans", "shorts"];

/**
 * Catalog rebuilt 2026-10-22 from the "Tách Nền Millions" lookbook shoot
 * (background-removed model photos from Google Drive).
 * Prices are in thousands of VND and are drafts for the owner to confirm.
 */
export const PRODUCTS: Product[] = [
  // sets
  {
    id: "set-hoodie-black",
    name: "black hoodie set",
    price: 890,
    category: "sets",
    images: [
      "/products/set-hoodie-black-1.jpg",
      "/products/set-hoodie-black-2.jpg",
      "/products/set-hoodie-black-3.jpg",
      "/products/set-hoodie-black-4.jpg",
      "/products/set-hoodie-black-5.jpg",
    ],
  },
  {
    id: "set-hoodie-grey",
    name: "grey hoodie set",
    price: 890,
    category: "sets",
    images: [
      "/products/set-hoodie-grey-1.jpg",
      "/products/set-hoodie-grey-2.jpg",
      "/products/set-hoodie-grey-3.jpg",
      "/products/set-hoodie-grey-4.jpg",
    ],
  },
  {
    id: "set-denim-dark",
    name: "dark denim set",
    price: 990,
    category: "sets",
    images: [
      "/products/set-denim-dark-1.jpg",
      "/products/set-denim-dark-2.jpg",
      "/products/set-denim-dark-3.jpg",
      "/products/set-denim-dark-4.jpg",
    ],
  },
  {
    id: "set-jeans-signature",
    name: "signature denim set",
    price: 1190,
    category: "sets",
    images: [
      "/products/set-jeans-signature-1.jpg",
      "/products/set-jeans-signature-2.jpg",
      "/products/set-jeans-signature-3.jpg",
      "/products/set-jeans-signature-4.jpg",
      "/products/set-jeans-signature-5.jpg",
    ],
  },

  // t-shirts
  {
    id: "tee-millions",
    name: "millions worldwide tee",
    price: 350,
    category: "t-shirts",
    images: [
      "/products/tee-millions-1.jpg",
      "/products/tee-millions-2.jpg",
      "/products/tee-millions-3.jpg",
      "/products/tee-millions-4.jpg",
      "/products/tee-millions-5.jpg",
    ],
  },
  {
    id: "tee-ruthless",
    name: "ruthless club tee",
    price: 350,
    category: "t-shirts",
    images: [
      "/products/tee-ruthless-1.jpg",
      "/products/tee-ruthless-2.jpg",
      "/products/tee-ruthless-3.jpg",
    ],
  },
  {
    id: "tee-white",
    name: "white logo tee",
    price: 320,
    category: "t-shirts",
    images: [
      "/products/tee-white-1.jpg",
      "/products/tee-white-2.jpg",
      "/products/tee-white-3.jpg",
      "/products/tee-white-4.jpg",
      "/products/tee-white-5.jpg",
    ],
  },
  {
    id: "tee-yellow-ls",
    name: "yellow long sleeve tee",
    price: 380,
    category: "t-shirts",
    images: [
      "/products/tee-yellow-ls-1.jpg",
      "/products/tee-yellow-ls-2.jpg",
      "/products/tee-yellow-ls-3.jpg",
      "/products/tee-yellow-ls-4.jpg",
    ],
  },
  {
    id: "tank-black",
    name: "black ribbed tank",
    price: 250,
    category: "t-shirts",
    images: [
      "/products/tank-black-1.jpg",
      "/products/tank-black-2.jpg",
      "/products/tank-black-3.jpg",
      "/products/tank-black-4.jpg",
      "/products/tank-black-5.jpg",
    ],
  },

  // shirts
  {
    id: "shirt-white",
    name: "white oxford shirt",
    price: 450,
    category: "shirts",
    images: [
      "/products/shirt-white-1.jpg",
      "/products/shirt-white-2.jpg",
      "/products/shirt-white-3.jpg",
      "/products/shirt-white-4.jpg",
      "/products/shirt-white-5.jpg",
    ],
  },
  {
    id: "jacket-black",
    name: "black stitch jacket",
    price: 690,
    category: "shirts",
    images: [
      "/products/jacket-black-1.jpg",
      "/products/jacket-black-2.jpg",
      "/products/jacket-black-3.jpg",
      "/products/jacket-black-4.jpg",
    ],
  },
  {
    id: "raglan-la",
    name: "los angeles raglan",
    price: 380,
    category: "shirts",
    images: [
      "/products/raglan-la-1.jpg",
      "/products/raglan-la-2.jpg",
      "/products/raglan-la-3.jpg",
      "/products/raglan-la-4.jpg",
    ],
  },

  // jeans
  {
    id: "jeans-wide",
    name: "wide leg jeans",
    price: 590,
    category: "jeans",
    images: [
      "/products/jeans-wide-1.jpg",
      "/products/jeans-wide-2.jpg",
      "/products/jeans-wide-3.jpg",
      "/products/jeans-wide-4.jpg",
      "/products/jeans-wide-5.jpg",
      "/products/jeans-wide-6.jpg",
    ],
  },
  {
    id: "jeans-washed",
    name: "washed wide leg jeans",
    price: 590,
    category: "jeans",
    images: ["/products/jeans-washed-1.jpg", "/products/jeans-washed-2.jpg"],
  },

  // shorts
  {
    id: "shorts-denim",
    name: "denim shorts",
    price: 390,
    category: "shorts",
    images: [
      "/products/shorts-denim-1.jpg",
      "/products/shorts-denim-2.jpg",
      "/products/shorts-denim-3.jpg",
      "/products/shorts-denim-4.jpg",
    ],
  },
  {
    id: "shorts-cargo",
    name: "cargo shorts",
    price: 390,
    category: "shorts",
    images: [
      "/products/shorts-cargo-1.jpg",
      "/products/shorts-cargo-2.jpg",
      "/products/shorts-cargo-3.jpg",
    ],
  },
  {
    id: "shorts-sweat",
    name: "sweat shorts",
    price: 320,
    category: "shorts",
    images: [
      "/products/shorts-sweat-1.jpg",
      "/products/shorts-sweat-2.jpg",
      "/products/shorts-sweat-3.jpg",
    ],
  },
];
