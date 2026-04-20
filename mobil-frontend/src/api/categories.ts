import apiClient from '@api/client';
import type { Category } from '@/types';

function normalizeCategory(category: Category): Category {
  return {
    ...category,
    id: category.id ?? category._id,
    _id: category._id ?? category.id,
    children: category.children?.map(normalizeCategory) ?? [],
  };
}

export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data.map(normalizeCategory);
  },
};
