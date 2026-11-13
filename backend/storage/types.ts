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
  payment: "cod" | "transfer" | "cash";
  status: "new" | "confirmed" | "shipping" | "delivered" | "cancelled";
  /**
   * Where the order came from. Absent on orders placed before POS
   * existed — those were all online. "cash" payment only happens
   * in-store; "cod" only happens online.
   */
  channel?: "online" | "in-store";
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
  /**
   * WhatsApp link shown as a floating button on the shop pages, e.g.
   * "https://wa.me/84901234567". Empty means no WhatsApp button.
   * Edited in /mw-office (Cài đặt → Liên hệ).
   */
  whatsappUrl?: string;
  /**
   * Bank account for transfer payments — used to build the VietQR code
   * on the POS bill (KiotViet-style: customer scans to pay the exact
   * amount with the order code as the transfer note). All three empty
   * means no QR on the bill. Edited in /mw-office (Cài đặt → Tài khoản
   * ngân hàng). bankCode is the VietQR bank code, e.g. "MB", "VCB", "TCB".
   */
  bankCode?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
};
