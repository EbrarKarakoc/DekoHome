import apiClient from '@api/client';
import type { Product, ProductFilters, ProductsResponse } from '@/types';

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    id: product.id ?? product._id,
    _id: product._id ?? product.id,
    images: product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [],
    imageUrl: product.imageUrl ?? product.images?.[0] ?? '',
  };
}

function toSearchParams(filters: ProductFilters): string {
  const params = new URLSearchParams();

  if (filters.q) params.append('q', filters.q);
  if (Array.isArray(filters.categoryId)) {
    if (filters.categoryId.length > 0) params.append('categoryId', filters.categoryId.join(','));
  } else if (filters.categoryId) {
    params.append('categoryId', filters.categoryId);
  }
  if (typeof filters.minPrice === 'number') params.append('minPrice', String(filters.minPrice));
  if (typeof filters.maxPrice === 'number') params.append('maxPrice', String(filters.maxPrice));
  if (typeof filters.page === 'number') params.append('page', String(filters.page));
  if (typeof filters.limit === 'number') params.append('limit', String(filters.limit));

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export const productsApi = {
  async getAll(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const query = toSearchParams(filters);
    const { data } = await apiClient.get<ProductsResponse>(`/products${query}`);

    return {
      ...data,
      products: data.products.map(normalizeProduct),
    };
  },

  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return normalizeProduct(data);
  },

  async create(productData: Partial<Product>): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', productData);
    return normalizeProduct(data);
  },

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const { data } = await apiClient.put<Product>(`/products/${id}`, productData);
    return normalizeProduct(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
