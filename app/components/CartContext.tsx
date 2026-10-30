"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Product } from "../data/products";

export type CartLine = { product: Product; qty: number; size?: string };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  /** Subtotal in thousands of VND (prices in products.ts are stored that way) */
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (id: string, size?: string) => void;
  remove: (id: string, size?: string) => void;
  setQty: (id: string, qty: number, size?: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue>({
  lines: [],
  count: 0,
  subtotal: 0,
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  add: () => {},
  remove: () => {},
  setQty: () => {},
  clear: () => {},
});

export function useCart() {
  return useContext(CartContext);
}

/* The cart lives in localStorage; useSyncExternalStore keeps it hydration-safe. */
const STORAGE_KEY = "mw-cart-v1";
const EMPTY = "{}";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function getServerSnapshot() {
  return EMPTY;
}

function writeCart(items: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — cart still works for this session via listeners */
  }
  listeners.forEach((cb) => cb());
}

/* Cart storage keys: "product-id" (no size chosen, old carts keep working)
 * or "product-id::SIZE" (size picked on the detail page). */
function cartKey(id: string, size?: string) {
  return size ? `${id}::${size}` : id;
}

function parseCart(
  products: Product[],
  raw: string,
): Record<string, number> {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const clean: Record<string, number> = {};
    for (const [key, qty] of Object.entries(parsed)) {
      const [id] = key.split("::");
      if (products.some((p) => p.id === id)) {
        clean[key] = Math.max(1, Math.min(10, Number(qty) || 1));
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function CartProvider({
  children,
  products,
}: {
  children: ReactNode;
  /** Live catalog from the page (DB when configured, code seed otherwise). */
  products: Product[];
}) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = useMemo(() => parseCart(products, raw), [products, raw]);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback(
    (id: string, size?: string) => {
      const key = cartKey(id, size);
      writeCart({ ...items, [key]: Math.min(10, (items[key] ?? 0) + 1) });
    },
    [items]
  );

  const remove = useCallback(
    (id: string, size?: string) => {
      const next = { ...items };
      delete next[cartKey(id, size)];
      writeCart(next);
    },
    [items]
  );

  const setQty = useCallback(
    (id: string, qty: number, size?: string) => {
      if (qty <= 0) {
        remove(id, size);
        return;
      }
      writeCart({ ...items, [cartKey(id, size)]: Math.min(10, qty) });
    },
    [items, remove]
  );

  const clear = useCallback(() => writeCart({}), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = Object.entries(items)
      .map(([key, qty]): CartLine | null => {
        const [id, size] = key.split("::");
        const product = products.find((p) => p.id === id);
        return product ? { product, qty, size: size || undefined } : null;
      })
      .filter((l): l is CartLine => l !== null);
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.product.price * l.qty, 0),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add,
      remove,
      setQty,
      clear,
    };
  }, [items, isOpen, add, remove, setQty, clear, products]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
