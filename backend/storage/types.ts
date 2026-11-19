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
  /** Color the customer picked on the detail page, if any. Absent
   *  means the product had no colors to pick from. */
  color?: string;
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

/**
 * Internal staff pages (/noibo). Kept completely apart from the shop
 * admin (/mw-office): staff log in with their own accounts, managed
 * from /noibo/caidat by a "founder"-role account. "staff" is Nhân viên,
 * "founder" is Founder — the founder does everything the old admin
 * role did (add staff, assign tasks, set schedules, edit settings).
 */
export type NoiboRole = "founder" | "staff";

/** A staff account. password_hash is NEVER selected into this type. */
export type NoiboStaff = {
  id: number;
  username: string;
  name: string;
  role: NoiboRole;
  active: boolean;
  createdAt: string;
};

export type NoiboTaskStatus = "todo" | "doing" | "done";

export type NoiboTask = {
  id: number;
  title: string;
  assigneeId: number | null;
  /** Resolved from the staff table when the task is listed. */
  assigneeName?: string;
  /** YYYY-MM-DD, or null when no deadline was set. */
  dueDate: string | null;
  status: NoiboTaskStatus;
  note: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type NoiboShift = {
  id: number;
  /** YYYY-MM-DD. */
  date: string;
  staffId: number;
  /** Resolved from the staff table when the shift is listed. */
  staffName?: string;
  label: string;
  note: string | null;
};

/** Settings for the internal pages, edited in /noibo/caidat. */
export type NoiboSettings = {
  /** Announcement banner shown at the top of /noibo. */
  announcement?: string;
  /** Shift labels offered in the schedule form, e.g. "Sáng 8h–12h". */
  shiftTemplates?: string[];
};

/** One check-in session: checkOutAt is null while still working. */
export type NoiboCheckin = {
  id: number;
  staffId: number;
  /** Resolved from the staff table when listed. */
  staffName?: string;
  /** ISO timestamps (UTC) of check-in / check-out. */
  checkInAt: string;
  checkOutAt: string | null;
};
