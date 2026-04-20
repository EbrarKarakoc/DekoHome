import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { productsApi } from '@api/products';
import type { ProductFilters } from '@/types';

export const PRODUCTS_KEYS = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => ['products', 'list', filters] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  infinite: (filters: Omit<ProductFilters, 'page'>) => ['products', 'infinite', filters] as const,
};

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: PRODUCTS_KEYS.list(filters),
    queryFn: () => productsApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: PRODUCTS_KEYS.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

export function useInfiniteProducts(filters: Omit<ProductFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: PRODUCTS_KEYS.infinite(filters),
    queryFn: ({ pageParam = 1 }) => productsApi.getAll({ ...filters, page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
