"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "vi" | "en";

const LANG_KEY = "mw-lang";

/**
 * Vietnamese / English dictionary for the customer-facing shop UI
 * (header, shop grid, product detail, cart, checkout, track order,
 * footers). Vietnamese is the default and matches the strings the
 * site already showed, so switching to VI changes nothing visible.
 *
 * NOT translated (kept Vietnamese): the 11 policy pages, /about,
 * /contact and /faq — legal/info copy that needs a reviewed
 * translation, not an on-the-fly one. The admin (/mw-office) also
 * stays Vietnamese: it is the owner's work screen.
 */
const DICT: Record<Lang, Record<string, string>> = {
  vi: {
    "nav.terms": "Điều khoản dịch vụ",
    "shop.showing": "Đang hiển thị {shown} trong {total} sản phẩm",
    "shop.sort": "Sắp xếp:",
    "shop.sortBy": "Sắp xếp theo",
    "shop.products": "{count} sản phẩm",
    "shop.product1": "1 sản phẩm",
    "sort.best-selling": "bán chạy nhất",
    "sort.name-a-z": "tên a-z",
    "sort.name-z-a": "tên z-a",
    "sort.price-low-high": "giá thấp đến cao",
    "sort.price-high-low": "giá cao đến thấp",
    "sort.newest": "mới nhất",
    "sort.oldest": "cũ nhất",
    "card.add": "Thêm vào giỏ",
    "card.chooseSize": "Chọn size",
    "card.added": "Đã thêm ✓",
    "card.soldOut": "Sold Out",
    "card.viewDetails": "Xem chi tiết",
    "card.origin": "Xuất xứ: Việt Nam",
    "card.view": "Xem {name}",
    "buy.sizeHint": "Chọn size trước khi thêm vào giỏ.",
    "buy.sizeNote":
      "Shop sẽ xác nhận size khi gọi xác nhận đơn. Bạn có thể ghi chú size mình mặc ở bước đặt hàng.",
    "buy.shipping":
      "Miễn phí vận chuyển toàn quốc • Shop xử lý đơn trong 1–2 ngày, giao hàng trong 3–5 ngày.",
    "buy.soldOutSuffix": " · Hết",
    "acc.desc": "Mô tả",
    "acc.sizeFit": "Size & Fit",
    "acc.shipping": "Giao hàng & Đổi trả",
    "acc.help": "Cần hỗ trợ?",
    "acc.noSizeChart":
      "Web hiện chưa bán theo bảng size cố định trên từng sản phẩm. Khi gọi xác nhận đơn, shop sẽ xác nhận size với bạn trước khi giao hàng.",
    "acc.shippingText":
      "Miễn phí vận chuyển toàn quốc. Shop xử lý đơn trong 1–2 ngày, giao hàng trong 3–5 ngày. Đổi trả trong 14 ngày với sản phẩm chưa mặc, chưa giặt, còn tag.",
    "acc.shippingLink": "Chính sách giao hàng",
    "acc.returnLink": "Chính sách đổi trả",
    "acc.contactShop": "Liên hệ shop",
    "acc.faq": "Câu hỏi thường gặp",
    "acc.trackOrder": "Theo dõi đơn hàng",
    "pieces.title": "Mua lẻ từng món",
    "pieces.summary": "Mua lẻ tổng {total}",
    "pieces.save": " · mua cả set {price} (tiết kiệm {saves})",
    "pieces.soldOut": "Hết hàng",
    "pieces.chooseSize": "Chọn size trước khi thêm.",
    "pieces.sizeOut": "(hết)",
    "related.title": "Phối cùng",
    "related.sub": "Gợi ý mặc cùng {name}",
    "cart.title": "Giỏ hàng",
    "cart.empty": "Giỏ hàng đang trống.",
    "cart.continue": "Tiếp tục mua sắm",
    "cart.close": "Đóng giỏ hàng",
    "cart.error": "Có lỗi xảy ra, thử lại giúp shop nhé.",
    "cart.orderError": "Không đặt được hàng, thử lại giúp shop nhé.",
    "cart.remove": "Xoá {name}",
    "cart.decrease": "Giảm số lượng",
    "cart.increase": "Tăng số lượng",
    "checkout.delivery": "Thông tin giao hàng",
    "checkout.name": "Họ và tên *",
    "checkout.phone": "Số điện thoại *",
    "checkout.address": "Địa chỉ giao hàng *",
    "checkout.note": "Ghi chú (không bắt buộc)",
    "checkout.payment": "Thanh toán",
    "checkout.cod": "Thanh toán khi nhận hàng (COD)",
    "checkout.codHint": "Được kiểm hàng trước khi thanh toán.",
    "checkout.transfer": "Chuyển khoản ngân hàng",
    "checkout.transferHint":
      "Thông tin chuyển khoản được gửi khi shop xác nhận đơn.",
    "checkout.submitting": "Đang đặt hàng…",
    "checkout.place": "Đặt hàng • {total}",
    "summary.subtotal": "Tạm tính",
    "summary.shipping": "Vận chuyển",
    "summary.free": "Miễn phí",
    "summary.total": "Tổng cộng",
    "summary.note":
      "Shop sẽ liên hệ xác nhận size và thông tin đơn qua điện thoại trước khi gửi hàng.",
    "success.title": "Đặt hàng thành công",
    "success.code": "Mã đơn hàng của anh/chị là",
    "success.text":
      "Shop sẽ gọi điện xác nhận đơn và size trong giờ hỗ trợ (10:00 – 21:30).",
    "success.transfer":
      " Thông tin chuyển khoản sẽ được gửi kèm khi shop xác nhận đơn.",
    "success.cod": " Anh/chị thanh toán khi nhận hàng nhé.",
    "success.track":
      " Tra cứu trạng thái đơn tại trang Theo dõi đơn hàng bằng mã đơn + Số điện thoại.",
    "track.code": "Mã đơn hàng (vd: MW-ABC12345)",
    "track.phone": "Số điện thoại đặt hàng",
    "track.searching": "Đang tra cứu…",
    "track.search": "Tra cứu đơn hàng",
    "track.notFound":
      "Không tìm thấy đơn hàng. Anh/chị kiểm tra lại mã đơn và số điện thoại, hoặc liên hệ shop qua trang Liên hệ để được hỗ trợ.",
    "track.status": "Trạng thái:",
    "track.total": "Tổng cộng",
    "track.payment": "Thanh toán:",
    "track.cod": "Khi nhận hàng (COD)",
    "track.transfer": "Chuyển khoản",
    "status.new": "Mới đặt — chờ shop xác nhận",
    "status.confirmed": "Đã xác nhận — đang chuẩn bị hàng",
    "status.shipping": "Đang giao hàng",
    "status.delivered": "Đã giao thành công",
    "status.cancelled": "Đã hủy",
    "gallery.prev": "Ảnh trước",
    "gallery.next": "Ảnh sau",
    "gallery.view": "Xem ảnh {n}",
    "footer.shop": "Shop",
    "footer.about": "Giới thiệu",
    "footer.contact": "Liên hệ",
    "footer.track": "Theo dõi đơn hàng",
    "footer.terms": "Điều khoản dịch vụ",
    "footer.refund": "Chính sách đổi trả",
    "footer.shipping": "Chính sách vận chuyển",
    "footer.inspection": "Chính sách kiểm hàng",
    "footer.privacy": "Chính sách bảo mật",
    "footer.payment": "Chính sách thanh toán",
    "footer.store": "Cửa hàng online",
    "footer.shopNow": "Mua sắm ngay",
  },
  en: {
    "nav.terms": "Terms of service",
    "shop.showing": "Showing {shown} of {total} products",
    "shop.sort": "Sort:",
    "shop.sortBy": "Sort by",
    "shop.products": "{count} products",
    "shop.product1": "1 product",
    "sort.best-selling": "best selling",
    "sort.name-a-z": "name a-z",
    "sort.name-z-a": "name z-a",
    "sort.price-low-high": "price low to high",
    "sort.price-high-low": "price high to low",
    "sort.newest": "newest first",
    "sort.oldest": "oldest first",
    "card.add": "Add to cart",
    "card.chooseSize": "Choose size",
    "card.added": "Added ✓",
    "card.soldOut": "Sold Out",
    "card.viewDetails": "View details",
    "card.origin": "Origin: Vietnam",
    "card.view": "View {name}",
    "buy.sizeHint": "Choose a size before adding to cart.",
    "buy.sizeNote":
      "The shop will confirm your size by phone when confirming the order. You can note your size at checkout.",
    "buy.shipping":
      "Free nationwide shipping • Orders are processed in 1–2 days and delivered in 3–5 days.",
    "buy.soldOutSuffix": " · Out",
    "acc.desc": "Description",
    "acc.sizeFit": "Size & Fit",
    "acc.shipping": "Shipping & Returns",
    "acc.help": "Need help?",
    "acc.noSizeChart":
      "The shop does not use a fixed size chart per product yet. When confirming your order by phone, the shop will confirm your size before shipping.",
    "acc.shippingText":
      "Free nationwide shipping. Orders are processed in 1–2 days and delivered in 3–5 days. Returns within 14 days for unworn, unwashed items with tags.",
    "acc.shippingLink": "Shipping policy",
    "acc.returnLink": "Return policy",
    "acc.contactShop": "Contact the shop",
    "acc.faq": "FAQ",
    "acc.trackOrder": "Track order",
    "pieces.title": "Buy pieces separately",
    "pieces.summary": "Pieces total {total}",
    "pieces.save": " · buy the full set {price} (save {saves})",
    "pieces.soldOut": "Sold out",
    "pieces.chooseSize": "Choose a size first.",
    "pieces.sizeOut": "(out)",
    "related.title": "Style with",
    "related.sub": "Pairs well with {name}",
    "cart.title": "Cart",
    "cart.empty": "Your cart is empty.",
    "cart.continue": "Continue shopping",
    "cart.close": "Close cart",
    "cart.error": "Something went wrong, please try again.",
    "cart.orderError": "Could not place your order, please try again.",
    "cart.remove": "Remove {name}",
    "cart.decrease": "Decrease quantity",
    "cart.increase": "Increase quantity",
    "checkout.delivery": "Delivery information",
    "checkout.name": "Full name *",
    "checkout.phone": "Phone number *",
    "checkout.address": "Delivery address *",
    "checkout.note": "Note (optional)",
    "checkout.payment": "Payment",
    "checkout.cod": "Cash on delivery (COD)",
    "checkout.codHint": "You can inspect the items before paying.",
    "checkout.transfer": "Bank transfer",
    "checkout.transferHint":
      "Transfer details are sent when the shop confirms your order.",
    "checkout.submitting": "Placing your order…",
    "checkout.place": "Place order • {total}",
    "summary.subtotal": "Subtotal",
    "summary.shipping": "Shipping",
    "summary.free": "Free",
    "summary.total": "Total",
    "summary.note":
      "The shop will call to confirm your size and order details before shipping.",
    "success.title": "Order placed",
    "success.code": "Your order code is",
    "success.text":
      "The shop will call to confirm your order and size during support hours (10:00 – 21:30).",
    "success.transfer":
      " Transfer details will be sent when the shop confirms your order.",
    "success.cod": " Please pay when your order arrives.",
    "success.track":
      " Track your order on the Track Order page with your order code + phone number.",
    "track.code": "Order code (e.g. MW-ABC12345)",
    "track.phone": "Phone number used for the order",
    "track.searching": "Looking up…",
    "track.search": "Track order",
    "track.notFound":
      "Order not found. Please check your order code and phone number, or contact the shop via the Contact page.",
    "track.status": "Status:",
    "track.total": "Total",
    "track.payment": "Payment:",
    "track.cod": "Cash on delivery (COD)",
    "track.transfer": "Bank transfer",
    "status.new": "Placed — waiting for confirmation",
    "status.confirmed": "Confirmed — preparing your order",
    "status.shipping": "Out for delivery",
    "status.delivered": "Delivered",
    "status.cancelled": "Cancelled",
    "gallery.prev": "Previous photo",
    "gallery.next": "Next photo",
    "gallery.view": "View photo {n}",
    "footer.shop": "Shop",
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.track": "Track order",
    "footer.terms": "Terms of service",
    "footer.refund": "Refund policy",
    "footer.shipping": "Shipping policy",
    "footer.inspection": "Inspection policy",
    "footer.privacy": "Privacy policy",
    "footer.payment": "Payment policy",
    "footer.store": "Online store",
    "footer.shopNow": "Shop now",
  },
};

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Look up a key, replacing {var} placeholders. Falls back to VI, then the key. */
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LangContextValue>({
  lang: "vi",
  setLang: () => {},
  t: (key) => DICT.vi[key] ?? key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("vi");

  // Saved choice wins over the default (read after mount so the first
  // server render and the first client render agree on "vi"). Deferred
  // in a timeout: the repo's lint rules forbid setState synchronously
  // in an effect body.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(LANG_KEY);
        if (saved === "en" || saved === "vi") setLangState(saved);
      } catch {
        // Private mode: stay on Vietnamese.
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // Private mode: the choice just doesn't persist.
    }
  }, [lang]);

  const t: LangContextValue["t"] = (key, vars) => {
    let s = DICT[lang][key] ?? DICT.vi[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(`{${k}}`, String(v));
      }
    }
    return s;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** VI | EN switch. Inherits the surrounding text colour/size. */
export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      role="group"
      aria-label="Language / Ngôn ngữ"
      className={`flex items-center gap-1 ${className}`}
    >
      {(["vi", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest transition-opacity ${
            lang === l
              ? "bg-black text-white"
              : "text-current opacity-60 hover:opacity-100"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
