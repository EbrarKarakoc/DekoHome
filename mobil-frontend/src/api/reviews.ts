import apiClient from '@api/client';
import type { Review, ReviewPayload, ServerOrder } from '@/types';

const REVIEWABLE_STATUSES = new Set([
  'Onaylandı',
  'Hazırlanıyor',
  'Kargoya Verildi',
  'Teslim Edildi',
]);

function normalizeReview(review: Review): Review {
  return {
    ...review,
    id: review.id ?? review._id,
    _id: review._id ?? review.id,
  };
}

export const reviewsApi = {
  async getByProduct(productId: string): Promise<Review[]> {
    const { data } = await apiClient.get<Review[]>(`/products/${productId}/reviews`);
    return data.map(normalizeReview);
  },

  async create(productId: string, payload: ReviewPayload): Promise<Review> {
    const { data } = await apiClient.post<Review>(`/products/${productId}/reviews`, payload);
    return normalizeReview(data);
  },

  async update(productId: string, reviewId: string, payload: Partial<ReviewPayload>): Promise<Review> {
    const { data } = await apiClient.put<Review>(`/products/${productId}/reviews/${reviewId}`, payload);
    return normalizeReview(data);
  },

  async remove(productId: string, reviewId: string): Promise<void> {
    await apiClient.delete(`/products/${productId}/reviews/${reviewId}`);
  },

  async canUserReview(productId: string): Promise<boolean> {
    const { data } = await apiClient.get<ServerOrder[]>('/orders');

    return data.some((order) => {
      if (!REVIEWABLE_STATUSES.has(order.status)) {
        return false;
      }

      return order.items.some((item) => item.productId === productId);
    });
  },
};
