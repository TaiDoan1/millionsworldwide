"use server";

import { PRODUCTS } from "../data/products";
import { appendOrder, listOrders } from "../lib/storage";

export type { Order, OrderItem } from "../lib/storage/types";
import type { Order, OrderItem } from "../lib/storage/types";

export type PlaceOrderInput = {
  items: { id: string; qty: number }[];
  customer: { name: string; phone: string; address: string; note?: string };
  payment: "cod" | "transfer";
};

export async function getOrders(): Promise<Order[]> {
  return listOrders();
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
  const name = (input.customer?.name || "").trim();
  const phone = (input.customer?.phone || "").trim();
  const address = (input.customer?.address || "").trim();
  if (!name || !phone || !address) {
    return { success: false, error: "Thiếu họ tên, số điện thoại hoặc địa chỉ." };
  }
  if (!/^[0-9+\s.()\-]{9,15}$/.test(phone)) {
    return { success: false, error: "Số điện thoại chưa đúng định dạng." };
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { success: false, error: "Giỏ hàng đang trống." };
  }

  const items: OrderItem[] = [];
  for (const raw of input.items) {
    const product = PRODUCTS.find((p) => p.id === raw.id);
    if (!product || product.soldOut) {
      return { success: false, error: "Có sản phẩm đã hết hàng trong giỏ." };
    }
    const qty = Math.max(1, Math.min(10, Math.floor(raw.qty) || 1));
    const existing = items.find((i) => i.id === product.id);
    if (existing) existing.qty = Math.min(10, existing.qty + qty);
    else items.push({ id: product.id, name: product.name, price: product.price, qty });
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
        note: (input.customer.note || "").trim() || undefined,
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

/** Look up an order by its code + the phone number used to place it. */
export async function findOrder(
  code: string,
  phone: string
): Promise<{
  found: boolean;
  order?: Pick<Order, "code" | "status" | "items" | "total" | "at" | "payment">;
}> {
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
