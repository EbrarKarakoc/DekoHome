import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { categoriesApi } from '@api/categories';
import type { Category } from '@/types';

export const CATEGORIES_KEYS = {
  all: ['categories'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEYS.all,
    queryFn: categoriesApi.getAll,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Category>) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEYS.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEYS.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEYS.all });
    },
  });
}
