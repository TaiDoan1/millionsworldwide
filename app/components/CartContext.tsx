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
import { PRODUCTS, type Product } from "../data/products";

export type CartLine = { product: Product; qty: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  /** Subtotal in thousands of VND (prices in products.ts are stored that way) */
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
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

function parseCart(raw: string): Record<string, number> {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const clean: Record<string, number> = {};
    for (const [id, qty] of Object.entries(parsed)) {
      if (PRODUCTS.some((p) => p.id === id)) {
        clean[id] = Math.max(1, Math.min(10, Number(qty) || 1));
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = useMemo(() => parseCart(raw), [raw]);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback(
    (id: string) => {
      writeCart({ ...items, [id]: Math.min(10, (items[id] ?? 0) + 1) });
    },
    [items]
  );

  const remove = useCallback(
    (id: string) => {
      const next = { ...items };
      delete next[id];
      writeCart(next);
    },
    [items]
  );

  const setQty = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) {
        remove(id);
        return;
      }
      writeCart({ ...items, [id]: Math.min(10, qty) });
    },
    [items, remove]
  );

  const clear = useCallback(() => writeCart({}), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = Object.entries(items)
      .map(([id, qty]) => {
        const product = PRODUCTS.find((p) => p.id === id);
        return product ? { product, qty } : null;
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
  }, [items, isOpen, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
