import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CART_KEYS } from '@hooks/useCart';
import { ordersApi, type UpdateOrderPayload } from '@api/orders';
import type { CreateOrderRequest } from '@/types';
import { useCartStore } from '@store/cartStore';

export const ORDER_KEYS = {
  list: ['orders'] as const,
  detail: (orderId: string) => ['orders', orderId] as const,
};

export function useOrders(enabled = true) {
  return useQuery({
    queryKey: ORDER_KEYS.list,
    queryFn: ordersApi.list,
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useOrder(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ORDER_KEYS.detail(orderId),
    queryFn: async () => {
      const orders = await ordersApi.list();
      const order = orders.find((item) => item.id === orderId || item._id === orderId);

      if (!order) {
        throw new Error('Siparis bulunamadi');
      }

      return order;
    },
    enabled: enabled && !!orderId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => ordersApi.create(payload),
    onSuccess: async () => {
      clearCart();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ORDER_KEYS.list }),
        queryClient.invalidateQueries({ queryKey: CART_KEYS.current }),
      ]);
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderPayload }) =>
      ordersApi.update(orderId, payload),
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ORDER_KEYS.list }),
        queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(order.id ?? '') }),
      ]);
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancel(orderId),
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ORDER_KEYS.list }),
        queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(order.id ?? '') }),
      ]);
    },
  });
}
