import apiClient from '@api/client';
import type { CreateOrderRequest, Order, OrderItem } from '@/types';

export interface UpdateOrderPayload {
  status?: Order['status'];
  address?: string;
}

function normalizeOrderItem(item: Partial<OrderItem> & { _id?: string; productId?: string | { _id?: string; id?: string } }): OrderItem {
  const productRef = item.productId as string | { _id?: string; id?: string } | undefined;
  const normalizedProductId =
    typeof productRef === 'string' ? productRef : productRef?._id ?? productRef?.id ?? '';

  return {
    itemId: item.itemId ?? item._id ?? '',
    productId: normalizedProductId,
    name: item.name,
    imageUrl: item.imageUrl,
    quantity: item.quantity ?? 0,
    price: item.price ?? 0,
  };
}

function normalizeOrder(order: Partial<Order> & { _id?: string; items?: Array<Partial<OrderItem> & { _id?: string }> }): Order {
  return {
    id: order.id ?? order._id ?? '',
    _id: order._id,
    status: order.status ?? 'Onaylandı',
    total: order.total ?? 0,
    address: order.address ?? '',
    paymentMethod: order.paymentMethod ?? 'Kapıda Ödeme',
    note: order.note,
    createdAt: order.createdAt ?? new Date().toISOString(),
    items: (order.items ?? []).map(normalizeOrderItem),
  };
}

export const ordersApi = {
  async list(): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>('/orders');
    return data.map((order) => normalizeOrder(order));
  },

  async create(payload: CreateOrderRequest): Promise<Order> {
    const { data } = await apiClient.post<Order>('/orders', payload);
    return normalizeOrder(data);
  },

  async update(orderId: string, payload: UpdateOrderPayload): Promise<Order> {
    const { data } = await apiClient.put<Order>(`/orders/${orderId}`, payload);
    return normalizeOrder(data);
  },

  async cancel(orderId: string): Promise<Order> {
    const { data } = await apiClient.delete<{ message: string; order?: Order } | Order>(`/orders/${orderId}`);

    if ('order' in data && data.order) {
      return normalizeOrder(data.order);
    }

    return normalizeOrder(data as Order);
  },
};
