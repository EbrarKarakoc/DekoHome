import { useRouter } from 'expo-router';
import { 
  User, 
  Camera, 
  Mail,
  Trash2,
  Info,
  Package,
  Lock
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
import { useState } from 'react';

import { useAuthStore } from '@store/authStore';
import { usersApi } from '@api/users';
import { getErrorMessage } from '@utils/error';
import WebHeader from '@components/layout/WebHeader';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();

  const [ad, setAd] = useState(user?.ad || '');
  const [soyad, setSoyad] = useState(user?.soyad || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      const updatedUser = await usersApi.update(user.id, { ad, soyad });
      setUser({ ...user, ad: updatedUser.ad, soyad: updatedUser.soyad });
      
      if (Platform.OS === 'web') {
        window.alert("Bilgileriniz başarıyla güncellendi.");
      } else {
        Alert.alert("Başarılı", "Bilgileriniz başarıyla güncellendi.");
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(getErrorMessage(error));
      } else {
        Alert.alert("Hata", getErrorMessage(error));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotImplemented = () => {
    if (Platform.OS === 'web') {
      window.alert("Bu bölüm henüz yapım aşamasındadır.");
    } else {
      Alert.alert("Bilgi", "Bu bölüm henüz yapım aşamasındadır.");
    }
  };

  const handleDeleteProfile = async () => {
      if (!user?.id) return;

      if (Platform.OS === 'web') {
        const confirmed = window.confirm("Profilinizi tamamen silmek üzeresiniz. Bu işlem geri alınamaz. Onaylıyor musunuz?");
        if (confirmed) {
            try {
              await usersApi.deleteAccount(user.id);
              window.alert("Hesabınız silindi.");
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              window.alert(getErrorMessage(error));
            }
        }
        return;
      }

      Alert.alert(
          "Hesabı Sil",
          "Profilinizi tamamen silmek üzeresiniz. Bu işlem geri alınamaz. Onaylıyor musunuz?",
          [
              { text: "İptal", style: "cancel" },
              { text: "Evet, Sil", style: "destructive", onPress: async () => {
                 try {
                   await usersApi.deleteAccount(user.id);
                   Alert.alert("Başarılı", "Hesabınız silindi.");
                   await logout();
                   router.replace('/(auth)/login');
                 } catch (error) {
                   Alert.alert("Hata", getErrorMessage(error));
                 }
              }},
          ]
      );
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
        
        <WebHeader />

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

        {/* Content Section (Responsive layout) */}
        <View className="px-6 md:px-12 pb-20 max-w-6xl mx-auto w-full flex-col md:flex-row mt-4">

          {/* Sidebar Menu */}
          <View className="mb-8 md:mb-0 md:w-72 md:mr-8 flex-col gap-3">
             <Pressable className="flex-row items-center p-4 rounded-2xl bg-yellow-600 shadow-sm shadow-yellow-600/20 active:opacity-90">
                <User size={20} color="white" />
                <Text className="ml-4 text-white font-inter-bold text-[15px]">Profil Bilgileri</Text>
             </Pressable>

             <Pressable onPress={handleNotImplemented} className="flex-row items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm active:bg-slate-50">
                <Package size={20} color="#64748b" />
                <Text className="ml-4 text-slate-600 font-inter-bold text-[15px]">Siparişlerim</Text>
             </Pressable>

             <Pressable onPress={handleNotImplemented} className="flex-row items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm active:bg-slate-50">
                <Lock size={20} color="#64748b" />
                <Text className="ml-4 text-slate-600 font-inter-bold text-[15px]">Şifre ve Güvenlik</Text>
             </Pressable>

             <View className="h-[1px] bg-slate-200 my-3" />

             <Pressable 
               onPress={handleDeleteProfile}
               className="flex-row items-center p-4 rounded-2xl bg-red-50/50 border border-red-100 active:bg-red-50"
             >
                <Trash2 size={20} color="#ef4444" />
                <Text className="ml-4 text-red-600 font-inter-bold text-[15px]">Hesabı Sil</Text>
             </Pressable>
          </View>

          {/* Main Form Area */}
          <View className="flex-1 bg-white p-6 md:p-10 rounded-[24px] shadow-sm shadow-slate-100 border border-slate-100/50">
            {/* Title */}
            <View className="flex-row items-center gap-4 mb-10">
               <View className="w-12 h-12 rounded-[14px] bg-yellow-50/80 items-center justify-center">
                  <User size={22} color="#D48806" />
               </View>
               <Text className="font-playfair text-3xl text-slate-900 italic font-bold">Kişisel Bilgileri Güncelle</Text>
            </View>

            {/* Form */}
            <View className="flex-row gap-5 mb-6 flex-wrap md:flex-nowrap">
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
                  value={user?.email || 'ornek@mail.com'} // Fallback for dev viewing
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
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

