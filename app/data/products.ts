export type Category = "t-shirts" | "sneakers" | "sweatpants";

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

export const CATEGORIES: Category[] = ["t-shirts", "sneakers", "sweatpants"];

export const PRODUCTS: Product[] = [
  // t-shirts — each product has its own image gallery (front / back / detail…)
  {
    id: "t1",
    name: "signature logo tee",
    price: 300,
    category: "t-shirts",
    images: ["/products/prod-1.jpg", "/products/prod-2.jpg", "/products/prod-3.jpg"],
  },
  {
    id: "t2",
    name: "stay mad stay real tee",
    price: 300,
    category: "t-shirts",
    images: ["/products/prod-2.jpg", "/products/prod-3.jpg", "/products/prod-1.jpg"],
    compareAt: 350,
  },
  {
    id: "t3",
    name: "worldwide oversized tee",
    price: 300,
    category: "t-shirts",
    images: ["/products/prod-3.jpg", "/products/prod-1.jpg", "/products/prod-2.jpg"],
    soldOut: true,
  },

  // sneakers
  { id: "s1", name: "court low sneakers", price: 650, category: "sneakers", images: ["/products/sneaker-1.jpg"] },
  { id: "s2", name: "vulc mid sneakers", price: 590, category: "sneakers", images: ["/products/sneaker-2.jpg"], soldOut: true },
  { id: "s3", name: "runner arrow sneakers", price: 720, category: "sneakers", images: ["/products/sneaker-3.jpg"], preOrder: true },

  // sweatpants
  { id: "p1", name: "diagonal sweatpants", price: 420, category: "sweatpants", images: ["/products/pants-1.jpg"] },
  { id: "p2", name: "monogram joggers", price: 390, category: "sweatpants", images: ["/products/pants-2.jpg"], compareAt: 450 },
  { id: "p3", name: "worldwide track pants", price: 450, category: "sweatpants", images: ["/products/pants-3.jpg"] },
];
