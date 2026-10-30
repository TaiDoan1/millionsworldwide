/** Backend service: order rules (validation, server-side pricing, order codes). Called only via app/actions/orders.ts. */
import { revalidatePath } from "next/cache";
import { isSizeSoldOut } from "../../app/data/products";
import { getProductsStrict } from "./products";
import {
  appendOrder,
  listOrders,
  updateOrderStatus as updateStoredOrderStatus,
} from "../storage";
import { isAdminRequest } from "../auth/admin-auth";
import { checkRateLimit, clientKey } from "../security/rate-limit";

export type { Order, OrderItem } from "../storage/types";
import type { Order, OrderItem } from "../storage/types";

export type PlaceOrderInput = {
  items: { id: string; qty: number; size?: string }[];
  customer: { name: string; phone: string; address: string; note?: string };
  payment: "cod" | "transfer";
};

export async function getOrders(): Promise<Order[]> {
  return listOrders();
}

/**
 * Change one order's status (admin only). Without this, customers checking
 * their order would see "Mới đặt" forever.
 */
export async function updateOrderStatus(
  code: string,
  status: Order["status"]
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAdminRequest())) {
    return { success: false, error: "Không có quyền thay đổi trạng thái đơn." };
  }
  const c = (code || "").trim().toUpperCase();
  const valid: Order["status"][] = [
    "new",
    "confirmed",
    "shipping",
    "delivered",
    "cancelled",
  ];
  if (!c || !valid.includes(status)) {
    return { success: false, error: "Trạng thái đơn chưa đúng." };
  }
  const updated = await updateStoredOrderStatus(c, status);
  if (!updated) {
    return { success: false, error: "Không tìm thấy đơn này." };
  }
  revalidatePath("/mw-office");
  return { success: true };
}

function newOrderCode(existing: Order[]): string {
  let code = "";
  do {
    code = `MW-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(
      Math.random() * 90 + 10
    )}`;
  } while (existing.some((o) => o.code === code));
  return code;
}

/**
 * Place an order. Prices are always recomputed from the catalogue on the
 * server — the client only sends product ids and quantities.
 */
export async function placeOrder(
  input: PlaceOrderInput
): Promise<{ success: boolean; code?: string; error?: string }> {
  // Bots hammering the order form: 10 orders per 10 minutes per IP.
  if (!checkRateLimit(await clientKey("order"), 10, 10 * 60 * 1000)) {
    return { success: false, error: "Anh/chị gửi đơn quá nhanh, thử lại sau vài phút nhé." };
  }
  const name = (input.customer?.name || "").trim();
  const phone = (input.customer?.phone || "").trim();
  const address = (input.customer?.address || "").trim();
  const note = (input.customer?.note || "").trim();
  if (!name || !phone || !address) {
    return { success: false, error: "Thiếu họ tên, số điện thoại hoặc địa chỉ." };
  }
  if (name.length > 100 || address.length > 500 || note.length > 500) {
    return { success: false, error: "Thông tin nhập vào quá dài." };
  }
  if (!/^[0-9+\s.()\-]{9,15}$/.test(phone)) {
    return { success: false, error: "Số điện thoại chưa đúng định dạng." };
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { success: false, error: "Giỏ hàng đang trống." };
  }

  const items: OrderItem[] = [];
  // Strict catalog: a DB outage must fail the order loudly, never price
  // it from the stale code seed while the live catalog is unreachable.
  let catalog: Awaited<ReturnType<typeof getProductsStrict>>;
  try {
    catalog = await getProductsStrict();
  } catch (error) {
    console.error("Failed to read pricing catalog:", error);
    return { success: false, error: "Không kết nối được kho dữ liệu, thử lại sau ít phút nhé." };
  }
  for (const raw of input.items) {
    const product = catalog.find((p) => p.id === raw.id);
    if (!product || product.soldOut) {
      return { success: false, error: "Có sản phẩm đã hết hàng trong giỏ." };
    }
    // Per-size stock: only a size explicitly marked soldOut is rejected.
    // No size chosen means the shop confirms size by phone, as before.
    const size = typeof raw.size === "string" ? raw.size.trim().slice(0, 10) : undefined;
    if (size && isSizeSoldOut(product, size)) {
      return { success: false, error: `Size ${size} của ${product.name} đã hết hàng.` };
    }
    const qty = Math.max(1, Math.min(10, Math.floor(raw.qty) || 1));
    const existing = items.find((i) => i.id === product.id && i.size === size);
    if (existing) existing.qty = Math.min(10, existing.qty + qty);
    else items.push({ id: product.id, name: product.name, price: product.price, qty, size });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  try {
    const orders = await listOrders();
    const order: Order = {
      code: newOrderCode(orders),
      items,
      total,
      customer: {
        name,
        phone,
        address,
        note: note || undefined,
      },
      payment: input.payment === "transfer" ? "transfer" : "cod",
      status: "new",
      at: new Date().toISOString(),
    };
    await appendOrder(order);
    return { success: true, code: order.code };
  } catch (error) {
    console.error("Failed to store order:", error);
    return { success: false, error: "Không lưu được đơn, anh/chị thử lại giúp shop nhé." };
  }
}

/** Look up an order by its code + the phone number used to place it. */export async function findOrder(
  code: string,
  phone: string
): Promise<{
  found: boolean;
  order?: Pick<Order, "code" | "status" | "items" | "total" | "at" | "payment">;
}> {
  // Lookup abuse guard: 30 lookups per 10 minutes per IP.
  if (!checkRateLimit(await clientKey("lookup"), 30, 10 * 60 * 1000)) {
    return { found: false };
  }
  const c = (code || "").trim().toUpperCase();
  const p = (phone || "").replace(/\s/g, "");
  if (!c || !p) return { found: false };
  const orders = await listOrders();
  const order = orders.find(
    (o) => o.code === c && o.customer.phone.replace(/\s/g, "") === p
  );
  if (!order) return { found: false };
  return {
    found: true,
    order: {
      code: order.code,
      status: order.status,
      items: order.items,
      total: order.total,
      at: order.at,
      payment: order.payment,
    },
  };
}
