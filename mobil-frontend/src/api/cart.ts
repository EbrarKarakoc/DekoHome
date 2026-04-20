import apiClient from '@api/client';
import type { Cart, CartItem } from '@/types';

export interface AddCartItemPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  itemId: string;
  quantity: number;
}

function normalizeCartItem(item: Partial<CartItem> & { _id?: string; productId?: string | { _id?: string; id?: string } }): CartItem {
  const productRef = item.productId as string | { _id?: string; id?: string } | undefined;
  const normalizedProductId =
    typeof productRef === 'string' ? productRef : productRef?._id ?? productRef?.id ?? '';

  return {
    itemId: item.itemId ?? item._id ?? '',
    productId: normalizedProductId,
    name: item.name ?? '',
    imageUrl: item.imageUrl ?? '',
    quantity: item.quantity ?? 0,
    price: item.price ?? 0,
    subtotal: item.subtotal ?? (item.quantity ?? 0) * (item.price ?? 0),
  };
}

function normalizeCart(cart: Partial<Cart> & { items?: Array<Partial<CartItem> & { _id?: string }> }): Cart {
  return {
    items: (cart.items ?? []).map(normalizeCartItem),
    total: cart.total ?? 0,
  };
}

export const cartApi = {
  async get(): Promise<Cart> {
    const { data } = await apiClient.get<Cart>('/cart');
    return normalizeCart(data);
  },

  async addItem(payload: AddCartItemPayload): Promise<Cart> {
    const { data } = await apiClient.post<Cart>('/cart/items', payload);
    return normalizeCart(data);
  },

  async updateItem(payload: UpdateCartItemPayload): Promise<Cart> {
    const { data } = await apiClient.put<Cart>(`/cart/items/${payload.itemId}`, {
      quantity: payload.quantity,
    });

    return normalizeCart(data);
  },

  async removeItem(itemId: string): Promise<Cart> {
    await apiClient.delete(`/cart/items/${itemId}`);
    return this.get();
  },
};
