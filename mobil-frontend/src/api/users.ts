import apiClient from '@api/client';
import type { UpdateUserRequest, User, UserCategoryPreference } from '@/types';

function normalizeUser(user: Partial<User> & { _id?: string }): User {
  return {
    id: user.id ?? user._id ?? '',
    _id: user._id,
    email: user.email ?? '',
    ad: user.ad ?? '',
    soyad: user.soyad ?? '',
    phone: user.phone,
    role: user.role ?? 'user',
  };
}

export const usersApi = {
  async getById(userId: string): Promise<User> {
    const { data } = await apiClient.get<User>(`/users/${userId}`);
    return normalizeUser(data);
  },

  async update(userId: string, payload: UpdateUserRequest): Promise<User> {
    const { data } = await apiClient.put<User>(`/users/${userId}`, payload);
    return normalizeUser(data);
  },

  async deleteAccount(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },

  async addCategoryPreference(userId: string, categoryId: string): Promise<UserCategoryPreference> {
    const { data } = await apiClient.post<UserCategoryPreference>(`/users/${userId}/preferences/categories`, {
      categoryId,
    });

    return {
      userId: data.userId,
      categoryId: data.categoryId,
    };
  },

  async removeCategoryPreference(userId: string, categoryId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/preferences/categories/${categoryId}`);
  },
};
