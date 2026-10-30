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
  /** Size the customer picked on the detail page, if any. Absent means
   *  the shop confirms size by phone, as before. */
  size?: string;
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
  comingSoonEnabled: boolean;
  launchDate: string;
  comingSoonTitle?: string;
  comingSoonSubtitle?: string;
  /** Promo strip at the top of the page, edited in /mw-office. */
  promoEnabled?: boolean;
  promoText?: string;
  /** Optional internal link for the strip, e.g. "/trangchu". */
  promoLink?: string;
  /**
   * Homepage copy, edited in /mw-office. Empty means "use the built-in
   * defaults": marqueeText is one phrase per line; editorialHeading is
   * one line per row of the big title; editorialText is the paragraph.
   */
  marqueeText?: string;
  editorialHeading?: string;
  editorialText?: string;
};
