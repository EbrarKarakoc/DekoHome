import { create } from 'zustand';

import type { Cart } from '@/types';

interface CartState extends Cart {
  itemCount: number;
  setCart: (cart: Cart) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  itemCount: 0,

  setCart: (cart) =>
    set({
      ...cart,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    }),

  clearCart: () =>
    set({
      items: [],
      total: 0,
      itemCount: 0,
    }),
}));
