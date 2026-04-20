import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cartApi, type AddCartItemPayload, type UpdateCartItemPayload } from '@api/cart';
import { useCartStore } from '@store/cartStore';

export const CART_KEYS = {
  current: ['cart'] as const,
};

export function useCart(enabled = true) {
  return useQuery({
    queryKey: CART_KEYS.current,
    queryFn: cartApi.get,
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationFn: (payload: AddCartItemPayload) => cartApi.addItem(payload),
    onSuccess: async (cart) => {
      setCart(cart);
      await queryClient.invalidateQueries({ queryKey: CART_KEYS.current });
    },
  });
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationFn: (payload: UpdateCartItemPayload) => cartApi.updateItem(payload),
    onSuccess: async (cart) => {
      setCart(cart);
      await queryClient.invalidateQueries({ queryKey: CART_KEYS.current });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: async (cart) => {
      setCart(cart);
      await queryClient.invalidateQueries({ queryKey: CART_KEYS.current });
    },
  });
}
