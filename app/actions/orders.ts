"use server";

// Thin transport layer for the order backend. All rules live in
// backend/services/orders.ts; this file only exposes them to the frontend
// so every existing import keeps working unchanged.
import {
  findOrder as findOrderService,
  getOrders as getOrdersService,
  placeOrder as placeOrderService,
} from "../../backend/services/orders";
import type {
  Order,
  OrderItem,
  PlaceOrderInput,
} from "../../backend/services/orders";

export type { Order, OrderItem, PlaceOrderInput };

export async function getOrders(): Promise<Order[]> {
  return getOrdersService();
}

export async function placeOrder(
  input: PlaceOrderInput
): Promise<{ success: boolean; code?: string; error?: string }> {
  return placeOrderService(input);
}

export async function findOrder(
  code: string,
  phone: string
): Promise<{
  found: boolean;
  order?: Pick<Order, "code" | "status" | "items" | "total" | "at" | "payment">;
}> {
  return findOrderService(code, phone);
}
