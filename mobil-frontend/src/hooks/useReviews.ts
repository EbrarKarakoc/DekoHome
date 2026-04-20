import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { reviewsApi } from '@api/reviews';
import { PRODUCTS_KEYS } from '@hooks/useProducts';
import type { ReviewPayload } from '@/types';

export const REVIEW_KEYS = {
  list: (productId: string) => ['reviews', productId] as const,
  canReview: (productId: string) => ['reviews', 'can-review', productId] as const,
};

export function useReviews(productId: string) {
  return useQuery({
    queryKey: REVIEW_KEYS.list(productId),
    queryFn: () => reviewsApi.getByProduct(productId),
    enabled: !!productId,
    staleTime: 1000 * 60,
  });
}

export function useCanReview(productId: string, enabled: boolean) {
  return useQuery({
    queryKey: REVIEW_KEYS.canReview(productId),
    queryFn: () => reviewsApi.canUserReview(productId),
    enabled: !!productId && enabled,
    staleTime: 1000 * 60,
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewPayload) => reviewsApi.create(productId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.list(productId) }),
        queryClient.invalidateQueries({ queryKey: PRODUCTS_KEYS.detail(productId) }),
        queryClient.invalidateQueries({ queryKey: PRODUCTS_KEYS.all }),
      ]);
    },
  });
}
