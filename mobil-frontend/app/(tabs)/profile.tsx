import { useRouter } from 'expo-router';
import {
  User,
  Camera,
  Mail,
  Trash2,
  Info,
  Package,
  Lock,
  Filter,
  X,
  Plus,
} from 'lucide-react-native';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useState, useEffect } from 'react';
import { showMessage } from 'react-native-flash-message';

import { useAuthStore } from '@store/authStore';
import { usersApi } from '@api/users';
import { useCategories } from '@hooks/useCategories';
import { getErrorMessage } from '@utils/error';
import WebHeader from '@components/layout/WebHeader';
import type { Category } from '@/types';

function flattenCats(items: Category[]): Category[] {
  const out: Category[] = [];
  for (const c of items) {
    out.push(c);
    if (c.children?.length) out.push(...flattenCats(c.children));
  }
  return out;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();

  const [ad, setAd] = useState(user?.ad || '');
  const [soyad, setSoyad] = useState(user?.soyad || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Category preferences (Gülnihal req 6 & 7)
  const { data: categoriesData } = useCategories();
  const allCategories = flattenCats(categoriesData ?? []);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [prefLoading, setPrefLoading] = useState<string | null>(null);

  const handleAddPreference = async (categoryId: string) => {
    if (!user?.id) return;
    try {
      setPrefLoading(categoryId);
      await usersApi.addCategoryPreference(user.id, categoryId);
      setSelectedPrefs(prev => [...prev, categoryId]);
      showMessage({ message: 'Kategori tercihiniz kaydedildi', type: 'success' });
    } catch (error: any) {
      const msg = getErrorMessage(error);
      if (msg.includes('zaten seçili')) {
        setSelectedPrefs(prev => [...prev, categoryId]);
      } else {
        showMessage({ message: msg, type: 'danger' });
      }
    } finally {
      setPrefLoading(null);
    }
  };

  const handleRemovePreference = async (categoryId: string) => {
    if (!user?.id) return;
    try {
      setPrefLoading(categoryId);
      await usersApi.removeCategoryPreference(user.id, categoryId);
      setSelectedPrefs(prev => prev.filter(id => id !== categoryId));
      showMessage({ message: 'Kategori filtresi kaldırıldı', type: 'success' });
    } catch (error) {
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    } finally {
      setPrefLoading(null);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const updatedUser = await usersApi.update(user.id, { ad, soyad });
      setUser({ ...user, ad: updatedUser.ad, soyad: updatedUser.soyad });
      showMessage({ message: 'Bilgileriniz başarıyla güncellendi.', type: 'success' });
    } catch (error) {
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotImplemented = () => {
    showMessage({ message: 'Bu bölüm henüz yapım aşamasındadır.', type: 'info' });
  };

  const handleDeleteProfile = () => {
    setShowDeleteConfirm(true);
  };

  const executeDeleteProfile = async () => {
    if (!user?.id) return;
    try {
      await usersApi.deleteAccount(user.id);
      showMessage({ message: 'Hesabınız başarıyla silindi.', type: 'success' });
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      showMessage({ message: getErrorMessage(error), type: 'danger' });
      setShowDeleteConfirm(false);
    }
  };


  return (
    <SafeAreaView
      className="flex-1 bg-[#FAFAF9]"
      style={Platform.OS === 'web' ? ({ flex: 1, height: '100vh', display: 'flex' } as any) : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        style={Platform.OS === 'web' ? ({ flex: 1, overflowY: 'auto' } as any) : undefined}
      >

        {Platform.OS === 'web' && <WebHeader />}

        {/* Profile Header (Circular Avatar and Name) */}
        <View className="items-center pt-8 pb-8 rounded-b-[40px] mb-2 z-10">
          <View className="relative mb-4">
            <View className="w-[100px] h-[100px] rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' }}
                className="w-full h-full object-cover"
              />
            </View>
            <Pressable className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-yellow-600 border-2 border-white items-center justify-center shadow-md">
              <Camera size={14} color="white" />
            </Pressable>
          </View>
          <Text className="font-playfair text-2xl text-slate-900 font-bold tracking-tight">{user?.ad} {user?.soyad}</Text>
          <Text className="text-slate-500 text-sm font-inter mt-1.5">DekoHome Üyesi</Text>
        </View>

        {/* Content Section (Mobile First Layout) */}
        <View className="px-5 pb-20 w-full flex-col mt-4">

          {/* Sidebar Menu (Now Top/List Menu on Mobile) */}
          <View className="mb-6 w-full flex-col gap-3">
            <Pressable className="flex-row items-center p-4 rounded-2xl bg-yellow-600 shadow-sm shadow-yellow-600/20 active:opacity-90">
              <User size={20} color="white" />
              <Text className="ml-4 text-white font-inter-bold text-[15px]">Profil Bilgileri</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/order/history')} className="flex-row items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm active:bg-slate-50">
              <Package size={20} color="#64748b" />
              <Text className="ml-4 text-slate-600 font-inter-bold text-[15px]">Siparişlerim</Text>
            </Pressable>

            <Pressable onPress={handleNotImplemented} className="flex-row items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm active:bg-slate-50">
              <Lock size={20} color="#64748b" />
              <Text className="ml-4 text-slate-600 font-inter-bold text-[15px]">Şifre ve Güvenlik</Text>
            </Pressable>

            <View className="h-[1px] bg-slate-200 my-3" />

            {showDeleteConfirm ? (
              <View className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <Text className="text-red-800 font-inter-bold text-sm mb-2">Hesabınızı silmek istediğinize emin misiniz?</Text>
                <Text className="text-red-600/80 font-inter text-xs mb-4">Bu işlem geri alınamaz ve tüm verileriniz silinir.</Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 bg-white rounded-lg border border-red-200 items-center"
                  >
                    <Text className="text-slate-600 font-inter-bold text-xs">İptal</Text>
                  </Pressable>
                  <Pressable
                    onPress={executeDeleteProfile}
                    className="flex-1 py-2 bg-red-600 rounded-lg items-center"
                  >
                    <Text className="text-white font-inter-bold text-xs">Evet, Sil</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handleDeleteProfile}
                className="flex-row items-center p-4 rounded-2xl bg-red-50/50 border border-red-100 active:bg-red-50 transition-colors"
              >
                <Trash2 size={20} color="#ef4444" />
                <Text className="ml-4 text-red-600 font-inter-bold text-[15px]">Hesabı Sil</Text>
              </Pressable>
            )}
          </View>

          {/* Main Form Area */}
          <View className="flex-1 bg-white p-5 rounded-[24px] shadow-sm shadow-slate-100 border border-slate-100/50">
            {/* Title */}
            <View className="flex-row items-center gap-4 mb-10">
              <View className="w-12 h-12 rounded-[14px] bg-yellow-50/80 items-center justify-center">
                <User size={22} color="#D48806" />
              </View>
              <Text className="font-playfair text-3xl text-slate-900 italic font-bold">Kişisel Bilgileri Güncelle</Text>
            </View>

            {/* Form */}
            <View className="gap-4 mb-6">
              <View className="flex-1 min-w-[45%]">
                <Text className="text-[11px] font-inter-bold text-slate-400 border-slate-400 mb-2 tracking-[1.5px] uppercase">Ad</Text>
                <View className="flex-row items-center border border-slate-200 rounded-[14px] px-4 h-14 bg-[#FAFAF9]">
                  <User size={18} color="#94a3b8" />
                  <TextInput
                    className="flex-1 ml-3 text-sm text-slate-900 font-inter outline-none"
                    value={ad}
                    onChangeText={setAd}
                  />
                </View>
              </View>

              <View className="flex-1 min-w-[45%]">
                <Text className="text-[11px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px] uppercase">Soyad</Text>
                <View className="flex-row items-center border border-slate-200 rounded-[14px] px-4 h-14 bg-[#FAFAF9]">
                  <User size={18} color="#94a3b8" />
                  <TextInput
                    className="flex-1 ml-3 text-sm text-slate-900 font-inter outline-none"
                    value={soyad}
                    onChangeText={setSoyad}
                  />
                </View>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-[11px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px] uppercase">E-Posta Adresı</Text>
              <View className="flex-row items-center border border-slate-200 rounded-[14px] px-4 h-14 bg-[#FAFAF9] opacity-70">
                <Mail size={18} color="#94a3b8" />
                <TextInput
                  editable={false}
                  className="flex-1 ml-3 text-sm text-slate-500 font-inter outline-none"
                  value={user?.email || 'ornek@mail.com'}
                />
              </View>
              <View className="flex-row items-center mt-3 ml-1 gap-2">
                <Info size={14} color="#bac4d1" />
                <Text className="text-slate-400 text-[11px] font-inter">E-posta adresi sistem güvenliği sebebiyle değiştirilemez.</Text>
              </View>
            </View>

            <View className="items-end">
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                className={`h-14 px-8 bg-[#0f172a] rounded-[16px] items-center justify-center mt-4 shadow-lg shadow-black/10 active:opacity-90 active:scale-95 transition-transform ${isSaving ? 'opacity-70' : ''}`}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-inter-bold text-[15px]">Değişiklikleri Kaydet</Text>
                )}
              </Pressable>
            </View>

            {/* Category Preferences Section (Gülnihal Req 6 & 7) */}
            <View className="mt-10 pt-8 border-t border-slate-100">
              <View className="flex-row items-center gap-3 mb-6">
                <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center">
                  <Filter size={18} color="#D48806" />
                </View>
                <View>
                  <Text className="font-inter-bold text-lg text-slate-900">Kategori Tercihleri</Text>
                  <Text className="text-slate-400 text-xs font-inter mt-0.5">İlgilendiğiniz kategorileri seçin</Text>
                </View>
              </View>

              {/* Selected preferences */}
              {selectedPrefs.length > 0 && (
                <View className="mb-4">
                  <Text className="text-[11px] font-inter-bold text-slate-400 mb-3 tracking-[1.5px] uppercase">Seçili Filtreler</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {selectedPrefs.map(prefId => {
                      const cat = allCategories.find(c => (c.id || c._id) === prefId);
                      if (!cat) return null;
                      return (
                        <Pressable
                          key={prefId}
                          onPress={() => handleRemovePreference(prefId)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#FEF3C7',
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: '#F59E0B',
                            gap: 6,
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>{cat.name}</Text>
                          {prefLoading === prefId ? (
                            <ActivityIndicator size="small" color="#92400E" />
                          ) : (
                            <X size={14} color="#92400E" />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Available categories */}
              <Text className="text-[11px] font-inter-bold text-slate-400 mb-3 tracking-[1.5px] uppercase">Kategoriler</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {allCategories.map(cat => {
                  const catId = cat.id || cat._id;
                  if (!catId) return null;
                  const isSelected = selectedPrefs.includes(catId);
                  if (isSelected) return null;
                  return (
                    <Pressable
                      key={catId}
                      onPress={() => handleAddPreference(catId)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F8FAFC',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '500', color: '#475569' }}>{cat.name}</Text>
                      {prefLoading === catId ? (
                        <ActivityIndicator size="small" color="#475569" />
                      ) : (
                        <Plus size={14} color="#475569" />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

