import { useQuery } from '@tanstack/react-query';

import { categoriesApi } from '@api/categories';

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
