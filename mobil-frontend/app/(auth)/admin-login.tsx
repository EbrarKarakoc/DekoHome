import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Mail, Lock, ShieldCheck, ArrowLeft, EyeOff, Eye } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';
import { useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { useAuth } from '@hooks/useAuth';
import { useAuthStore } from '@store/authStore';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginScreen() {
  const router = useRouter();
  const { handleLogin } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await handleLogin(values);
      
      // Check role after login
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        showMessage({ message: 'Yönetici olarak giriş yapıldı', type: 'success' });
        router.replace('/(admin)/dashboard');
      } else {
        showMessage({ message: 'Bu alan sadece yöneticiler içindir!', type: 'danger' });
        // Optional: logout if not admin?
      }
    } catch (e) {
      // Error handled in useAuth
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <View className="pt-16 px-8 pb-10">
            <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mb-8">
              <ArrowLeft size={20} color="white" />
            </Pressable>
            
            <View className="w-16 h-16 rounded-2xl bg-amber-500 items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
              <ShieldCheck size={32} color="white" />
            </View>
            
            <Text className="font-playfair text-4xl text-white font-bold mb-2">Yönetici Girişi</Text>
            <Text className="text-slate-400 text-base font-inter">DekoHome yönetim paneline erişmek için bilgilerinizi girin.</Text>
          </View>

          {/* Form */}
          <View className="flex-1 bg-white rounded-t-[40px] px-8 pt-10 pb-20">
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-[10px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px] uppercase">E-Posta Adresi</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="flex-row items-center border border-slate-200 rounded-2xl px-4 h-14 bg-slate-50">
                    <Mail size={20} color="#94a3b8" />
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="admin@dekohome.com"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 ml-3 text-base text-slate-900 font-inter"
                      value={value}
                    />
                  </View>
                )}
              />
            </View>

            {/* Password Input */}
            <View className="mb-10">
              <Text className="text-[10px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px] uppercase">Şifre</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="flex-row items-center border border-slate-200 rounded-2xl px-4 h-14 bg-slate-50">
                    <Lock size={20} color="#94a3b8" />
                    <TextInput
                      secureTextEntry={!isPasswordVisible}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 mx-3 text-base text-slate-900 font-inter"
                      value={value}
                    />
                    <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} className="p-2">
                      {isPasswordVisible ? (
                        <EyeOff size={20} color="#94a3b8" />
                      ) : (
                        <Eye size={20} color="#94a3b8" />
                      )}
                    </Pressable>
                  </View>
                )}
              />
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={`h-16 rounded-2xl bg-amber-500 flex-row items-center justify-center shadow-lg shadow-amber-500/30 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-lg font-inter-bold">Sisteme Giriş Yap</Text>
              )}
            </Pressable>

            <View className="items-center mt-8">
              <Text className="text-slate-400 text-xs text-center leading-5 font-inter">
                Bu alan sadece yetkili personel içindir. İzinsiz girişler kayıt altına alınmaktadır.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
