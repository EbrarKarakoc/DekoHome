import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '@api/users';
import type { UpdateUserRequest } from '@/types';
import { getErrorMessage } from '@utils/error';

const preferenceStorageKey = (userId: string) => `user_category_preferences_${userId}`;

async function readPreferenceIds(userId: string): Promise<string[]> {
  const raw = await AsyncStorage.getItem(preferenceStorageKey(userId));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

async function writePreferenceIds(userId: string, categoryIds: string[]): Promise<void> {
  await AsyncStorage.setItem(preferenceStorageKey(userId), JSON.stringify(categoryIds));
}

export const USER_KEYS = {
  profile: (userId: string) => ['user', userId, 'profile'] as const,
  preferences: (userId: string) => ['user', userId, 'preferences'] as const,
};

export function useUserProfile(userId: string, enabled = true) {
  return useQuery({
    queryKey: USER_KEYS.profile(userId),
    queryFn: () => usersApi.getById(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60,
  });
}

export function useUpdateUserProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserRequest) => usersApi.update(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USER_KEYS.profile(userId) });
    },
  });
}

export function useDeleteAccount(userId: string) {
  return useMutation({
    mutationFn: () => usersApi.deleteAccount(userId),
  });
}

export function useCategoryPreferences(userId: string, enabled = true) {
  return useQuery({
    queryKey: USER_KEYS.preferences(userId),
    queryFn: () => readPreferenceIds(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 30,
  });
}

export function useAddCategoryPreference(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      try {
        await usersApi.addCategoryPreference(userId, categoryId);
      } catch (error) {
        const message = getErrorMessage(error).toLowerCase();
        if (!message.includes('zaten secili') && !message.includes('zaten seçili')) {
          throw error;
        }
      }

      const current = await readPreferenceIds(userId);
      if (!current.includes(categoryId)) {
        await writePreferenceIds(userId, [...current, categoryId]);
      }

      return categoryId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USER_KEYS.preferences(userId) });
    },
  });
}

export function useRemoveCategoryPreference(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      try {
        await usersApi.removeCategoryPreference(userId, categoryId);
      } catch (error) {
        const message = getErrorMessage(error).toLowerCase();
        if (!message.includes('kayit bulunamadi') && !message.includes('kayıt bulunamadı')) {
          throw error;
        }
      }

      const current = await readPreferenceIds(userId);
      await writePreferenceIds(
        userId,
        current.filter((value) => value !== categoryId)
      );

      return categoryId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USER_KEYS.preferences(userId) });
    },
  });
}
