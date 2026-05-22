import { create } from "zustand";
import type { CartItem, PaymentMethod } from "@/types";

// ─── State shape ──────────────────────────────────────────
interface CartState {
  items: CartItem[];
  cartDiscount: number; // global cart discount in DZD

  // ── Item actions ──────────────────────────────────────────
  addItem: (item: Omit<CartItem, "quantity" | "discount">) => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  updateItemDiscount: (variantId: number, discount: number) => void;

  // ── Cart-level actions ────────────────────────────────────
  setCartDiscount: (discount: number) => void;
  clearCart: () => void;
}

// ─── Store ────────────────────────────────────────────────
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartDiscount: 0,

  addItem: (newItem) => {
    const existing = get().items.find((i) => i.variantId === newItem.variantId);

    if (existing) {
      // Increment quantity — never exceed maxStock
      if (existing.quantity >= existing.maxStock) return;
      set((state) => ({
        items: state.items.map((i) =>
          i.variantId === newItem.variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      }));
    } else {
      // Add new row
      set((state) => ({
        items: [...state.items, { ...newItem, quantity: 1, discount: 0 }],
      }));
    }
  },

  removeItem: (variantId) =>
    set((state) => ({
      items: state.items.filter((i) => i.variantId !== variantId),
    })),

  updateQuantity: (variantId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
          : i
      ),
    })),

  updateItemDiscount: (variantId, discount) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.variantId === variantId
          ? { ...i, discount: Math.max(0, discount) }
          : i
      ),
    })),

  setCartDiscount: (discount) =>
    set({ cartDiscount: Math.max(0, discount) }),

  clearCart: () => set({ items: [], cartDiscount: 0 }),
}));

// ─── Selectors ────────────────────────────────────────────
// Use these with useCartStore(cartSelectors.xxx) for efficient re-renders

export const cartSelectors = {
  subtotal: (s: CartState) =>
    s.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

  totalItemDiscounts: (s: CartState) =>
    s.items.reduce((sum, i) => sum + i.discount, 0),

  total: (s: CartState) => {
    const subtotal = cartSelectors.subtotal(s);
    const itemDisc = cartSelectors.totalItemDiscounts(s);
    return Math.max(0, subtotal - itemDisc - s.cartDiscount);
  },

  itemCount: (s: CartState) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),

  isEmpty: (s: CartState) => s.items.length === 0,

  // Build payload for pos:checkout IPC call
  checkoutPayload: (
    s: CartState,
    opts: { userId: number; customerId?: number; paymentMethod: PaymentMethod; notes?: string }
  ) => ({
    userId: opts.userId,
    customerId: opts.customerId,
    paymentMethod: opts.paymentMethod,
    notes: opts.notes,
    total: cartSelectors.total(s),
    discount: cartSelectors.totalItemDiscounts(s) + s.cartDiscount,
    tax: 0,
    items: s.items.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discount,
    })),
  }),
};
