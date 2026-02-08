import { create } from "zustand"

export interface CartItem {
  id: string
  productId?: string
  name: string
  quantity: number
  unitPrice: number
}

interface CartStore {
  items: CartItem[]
  taxRate: number
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setTaxRate: (rate: number) => void
  subtotal: () => number
  taxAmount: () => number
  total: () => number
}

let counter = 0

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  taxRate: 0.2,
  addItem: (item) =>
    set((s) => ({
      items: [...s.items, { ...item, id: `cart-${++counter}` }],
    })),
  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  updateQuantity: (id, quantity) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),
  clearCart: () => set({ items: [] }),
  setTaxRate: (rate) => set({ taxRate: rate }),
  subtotal: () => get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
  taxAmount: () => get().subtotal() * get().taxRate,
  total: () => get().subtotal() + get().taxAmount(),
}))
