export type Category = "t-shirts" | "sneakers" | "sweatpants";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  soldOut?: boolean;
  preOrder?: boolean;
  /** Original price — set to show a "save" badge. */
  compareAt?: number;
};

export const CATEGORIES: Category[] = ["t-shirts", "sneakers", "sweatpants"];

export const PRODUCTS: Product[] = [
  // t-shirts
  { id: "t1", name: "diagonal arrow tee", price: 300, category: "t-shirts", image: "/products/tee-1.jpg" },
  { id: "t2", name: "monogram skate tee", price: 300, category: "t-shirts", image: "/products/tee-2.jpg" },
  { id: "t3", name: "worldwide logo tee", price: 300, category: "t-shirts", image: "/products/tee-3.jpg", soldOut: true },
  { id: "t4", name: "cupid graphic tee", price: 350, category: "t-shirts", image: "/products/tee-4.jpg" },
  { id: "t5", name: "cloud arrow tee", price: 300, category: "t-shirts", image: "/products/tee-5.jpg", compareAt: 350 },
  { id: "t6", name: "building slim logo tee", price: 300, category: "t-shirts", image: "/products/tee-6.jpg", preOrder: true },

  // sneakers
  { id: "s1", name: "court low sneakers", price: 650, category: "sneakers", image: "/products/sneaker-1.jpg" },
  { id: "s2", name: "vulc mid sneakers", price: 590, category: "sneakers", image: "/products/sneaker-2.jpg", soldOut: true },
  { id: "s3", name: "runner arrow sneakers", price: 720, category: "sneakers", image: "/products/sneaker-3.jpg", preOrder: true },
  { id: "s4", name: "worldwide skate low", price: 680, category: "sneakers", image: "/products/sneaker-4.jpg" },

  // sweatpants
  { id: "p1", name: "diagonal sweatpants", price: 420, category: "sweatpants", image: "/products/pants-1.jpg" },
  { id: "p2", name: "monogram joggers", price: 390, category: "sweatpants", image: "/products/pants-2.jpg", compareAt: 450 },
  { id: "p3", name: "worldwide track pants", price: 450, category: "sweatpants", image: "/products/pants-3.jpg" },
  { id: "p4", name: "arrow cargo sweatpants", price: 480, category: "sweatpants", image: "/products/pants-4.jpg", preOrder: true },
];
