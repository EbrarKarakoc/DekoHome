import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { EmptyState } from '@components/common/EmptyState';
import { ErrorMessage } from '@components/common/ErrorMessage';
import Colors from '@constants/colors';
import { useAuth } from '@hooks/useAuth';
import { useCategories } from '@hooks/useCategories';
import {
  useAddCategoryPreference,
  useCategoryPreferences,
  useDeleteAccount,
  useRemoveCategoryPreference,
  useUpdateUserProfile,
  useUserProfile,
} from '@hooks/useUsers';
import { useAuthStore } from '@store/authStore';
import type { Category } from '@/types';
import { getErrorMessage } from '@utils/error';
import { hapticError, hapticSuccess, hapticTap } from '@utils/haptics';

function flattenCategories(items: Category[]): Category[] {
  const output: Category[] = [];

  for (const item of items) {
    output.push(item);
    if (item.children?.length) {
      output.push(...flattenCategories(item.children));
    }
  }

  return output;
}

export default function ProfileScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { handleLogout } = useAuth();
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const userId = user?.id ?? '';
  const canFetch = isAuthenticated && !!userId;

  const userQuery = useUserProfile(userId, canFetch);
  const categoriesQuery = useCategories();
  const preferencesQuery = useCategoryPreferences(userId, canFetch);

  const updateProfileMutation = useUpdateUserProfile(userId);
  const addPreferenceMutation = useAddCategoryPreference(userId);
  const removePreferenceMutation = useRemoveCategoryPreference(userId);
  const deleteAccountMutation = useDeleteAccount(userId);

  const categories = useMemo(() => {
    const flattened = flattenCategories(categoriesQuery.data ?? []);
    return flattened.filter((item) => !!(item.id ?? item._id));
  }, [categoriesQuery.data]);

  const selectedCategoryIds = preferencesQuery.data ?? [];

  useEffect(() => {
    const profile = userQuery.data;
    if (!profile) {
      return;
    }

    const mergedRole = user?.role ?? profile.role;
    setUser({ ...profile, role: mergedRole });
    setAd(profile.ad);
    setSoyad(profile.soyad);
  }, [setUser, user?.role, userQuery.data]);

  useEffect(() => {
    if (userQuery.data) {
      return;
    }

    if (user) {
      setAd(user.ad);
      setSoyad(user.soyad);
    }
  }, [user, userQuery.data]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!userId) {
    return <Redirect href="/(auth)/login" />;
  }

  if (userQuery.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (userQuery.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 16, justifyContent: 'center' }}>
        <ErrorMessage
          message={getErrorMessage(userQuery.error)}
          onRetry={async () => {
            await userQuery.refetch();
          }}
        />
      </View>
    );
  }

  const isSavingProfile = updateProfileMutation.isPending;
  const isUpdatingPreference = addPreferenceMutation.isPending || removePreferenceMutation.isPending;

  const onSaveProfile = async () => {
    const trimmedAd = ad.trim();
    const trimmedSoyad = soyad.trim();

    if (!trimmedAd || !trimmedSoyad) {
      await hapticError();
      showMessage({ message: 'Ad ve soyad alanlari zorunludur', type: 'warning' });
      return;
    }

    try {
      await hapticTap();
      const updated = await updateProfileMutation.mutateAsync({ ad: trimmedAd, soyad: trimmedSoyad });
      setUser({ ...updated, role: user?.role ?? updated.role });
      await hapticSuccess();
      showMessage({ message: 'Profil bilgileriniz guncellendi', type: 'success' });
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  const onToggleCategory = async (categoryId: string) => {
    try {
      await hapticTap();
      if (selectedCategoryIds.includes(categoryId)) {
        await removePreferenceMutation.mutateAsync(categoryId);
        await hapticSuccess();
        showMessage({ message: 'Kategori tercihi kaldirildi', type: 'success' });
      } else {
        await addPreferenceMutation.mutateAsync(categoryId);
        await hapticSuccess();
        showMessage({ message: 'Kategori tercihi eklendi', type: 'success' });
      }
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  const onDeleteAccount = async () => {
    try {
      await hapticTap();
      await deleteAccountMutation.mutateAsync();
      setDeleteModalVisible(false);
      await hapticSuccess();
      showMessage({ message: 'Hesabiniz silindi', type: 'success' });
      await handleLogout();
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={userQuery.isRefetching || categoriesQuery.isRefetching || preferencesQuery.isRefetching}
            onRefresh={async () => {
              await Promise.all([userQuery.refetch(), categoriesQuery.refetch(), preferencesQuery.refetch()]);
            }}
            tintColor={Colors.primary}
          />
        }
      >
        <Text style={{ fontSize: 26, fontWeight: '700', color: Colors.text }}>Profilim</Text>

        <View
          style={{
            marginTop: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 14,
            padding: 12,
            backgroundColor: Colors.surface,
            gap: 6,
          }}
        >
          <Text style={{ color: Colors.text, fontWeight: '700' }}>
            {user?.ad} {user?.soyad}
          </Text>
          <Text style={{ color: Colors.textSecondary }}>{userQuery.data?.email ?? user?.email ?? '-'}</Text>
          <Text style={{ color: Colors.textSecondary }}>Rol: {user?.role}</Text>
        </View>

        <Text style={{ marginTop: 18, marginBottom: 8, color: Colors.text, fontWeight: '700' }}>Profil Duzenle</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 14,
            padding: 12,
            backgroundColor: Colors.surface,
            gap: 10,
          }}
        >
          <View>
            <Text style={{ color: Colors.textSecondary, marginBottom: 6 }}>Ad</Text>
            <TextInput
              value={ad}
              onChangeText={setAd}
              placeholder="Ad"
              placeholderTextColor={Colors.textMuted}
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                backgroundColor: Colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: Colors.text,
              }}
            />
          </View>

          <View>
            <Text style={{ color: Colors.textSecondary, marginBottom: 6 }}>Soyad</Text>
            <TextInput
              value={soyad}
              onChangeText={setSoyad}
              placeholder="Soyad"
              placeholderTextColor={Colors.textMuted}
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                backgroundColor: Colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: Colors.text,
              }}
            />
          </View>

          <Pressable
            disabled={isSavingProfile}
            onPress={onSaveProfile}
            style={{
              marginTop: 2,
              height: 44,
              borderRadius: 12,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSavingProfile ? 0.7 : 1,
            }}
          >
            {isSavingProfile ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Profili Kaydet</Text>
            )}
          </Pressable>
        </View>

        <Text style={{ marginTop: 18, marginBottom: 8, color: Colors.text, fontWeight: '700' }}>Kategori Tercihleri</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 14,
            padding: 12,
            backgroundColor: Colors.surface,
          }}
        >
          {categoriesQuery.isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : categories.length === 0 ? (
            <EmptyState icon="list-outline" title="Kategori bulunamadi" description="Tercih secmek icin kategori listesi bekleniyor." />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {categories.map((category) => {
                const categoryId = category.id ?? category._id ?? '';
                const selected = selectedCategoryIds.includes(categoryId);

                return (
                  <Pressable
                    key={categoryId}
                    disabled={isUpdatingPreference}
                    onPress={() => onToggleCategory(categoryId)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: selected ? Colors.primary : Colors.border,
                      backgroundColor: selected ? '#FEF3C7' : Colors.surface,
                      opacity: isUpdatingPreference ? 0.7 : 1,
                    }}
                  >
                    <Text style={{ color: selected ? Colors.primaryDark : Colors.text }}>{category.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Pressable
          onPress={() => router.push('/order/history')}
          style={{
            marginTop: 18,
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: Colors.text, fontWeight: '700' }}>Siparis Gecmisi</Text>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={{
            marginTop: 10,
            backgroundColor: Colors.primary,
            borderRadius: 12,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Cikis Yap</Text>
        </Pressable>

        <View
          style={{
            marginTop: 18,
            borderWidth: 1,
            borderColor: '#FECACA',
            borderRadius: 14,
            padding: 12,
            backgroundColor: '#FEF2F2',
            gap: 8,
          }}
        >
          <Text style={{ color: '#991B1B', fontWeight: '700' }}>Tehlikeli Islem</Text>
          <Text style={{ color: '#B91C1C' }}>Hesabinizi silerseniz geri alinamaz.</Text>
          <Pressable
            onPress={() => setDeleteModalVisible(true)}
            style={{
              marginTop: 2,
              height: 42,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.error,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FEE2E2',
            }}
          >
            <Text style={{ color: Colors.error, fontWeight: '700' }}>Hesabi Sil</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View style={{ backgroundColor: Colors.surface, borderRadius: 14, padding: 16 }}>
            <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700' }}>Hesabi silmek istiyor musunuz?</Text>
            <Text style={{ marginTop: 8, color: Colors.textSecondary }}>
              Bu islem geri alinmaz ve tum hesap verileriniz etkilenir.
            </Text>

            <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <Pressable
                disabled={deleteAccountMutation.isPending}
                onPress={() => setDeleteModalVisible(false)}
                style={{
                  height: 40,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  paddingHorizontal: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: Colors.textSecondary, fontWeight: '700' }}>Vazgec</Text>
              </Pressable>

              <Pressable
                disabled={deleteAccountMutation.isPending}
                onPress={onDeleteAccount}
                style={{
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: Colors.error,
                  paddingHorizontal: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: deleteAccountMutation.isPending ? 0.7 : 1,
                }}
              >
                {deleteAccountMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Evet, Sil</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
