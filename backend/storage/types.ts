/**
 * Shared storage types for orders, subscribers and site settings.
 * The server actions in app/actions re-export these so existing
 * imports (e.g. `import { type Order } from "../actions/orders"`)
 * keep working unchanged.
 */

export type OrderItem = {
  id: string;
  name: string;
  /** Unit price in thousands of VND, as stored in products.ts */
  price: number;
  qty: number;
};

export type Order = {
  code: string;
  items: OrderItem[];
  /** Total in thousands of VND */
  total: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    note?: string;
  };
  payment: "cod" | "transfer";
  status: "new" | "confirmed" | "shipping" | "delivered" | "cancelled";
  at: string;
};

export type Subscriber = {
  email: string;
  source: string;
  at: string;
};

export type Settings = {
  bannerSize: "full" | "large" | "medium";
  textColor: "white" | "black";
  comingSoonEnabled: boolean;
  launchDate: string;
  comingSoonTitle?: string;
  comingSoonSubtitle?: string;
};
