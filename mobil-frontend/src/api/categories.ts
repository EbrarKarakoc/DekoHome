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
  async create(categoryData: Partial<Category>): Promise<Category> {
    const { data } = await apiClient.post<Category>('/categories', categoryData);
    return normalizeCategory(data);
  },
  async update(id: string, categoryData: Partial<Category>): Promise<Category> {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, categoryData);
    return normalizeCategory(data);
  },
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
