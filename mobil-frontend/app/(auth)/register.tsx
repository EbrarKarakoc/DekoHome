import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, User, ChevronRight, Home, ArrowLeft } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import Assets from '@constants/assets';
import { useAuth } from '@hooks/useAuth';

const registerSchema = z.object({
  ad: z.string().min(2, 'Geçerli bir ad girin'),
  soyad: z.string().min(2, 'Geçerli bir soyad girin'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm, {
  message: "Şifreler eşleşmiyor",
  path: ["passwordConfirm"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { handleRegister } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { ad: '', soyad: '', email: '', password: '', passwordConfirm: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await handleRegister({
      ad: values.ad,
      soyad: values.soyad,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAFAF9]"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 flex-col md:flex-row">
          {/* Header Hero Section */}
          <View className="w-full h-[320px] md:h-auto md:w-[45%] md:flex-1">
            <ImageBackground
              source={Assets.images.registerBg}
              className="w-full h-full justify-between p-6"
              resizeMode="cover"
            >
              <View className="flex-row items-center justify-between mt-6">
                <Pressable
                  onPress={() => router.back()}
                  className="w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md"
                >
                  <ArrowLeft size={24} color="#FFFFFF" />
                </Pressable>
                <View className="flex-row items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <Home size={16} color="#D48806" />
                  <Text className="text-white text-xs font-bold tracking-tight">DekoHome</Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="font-playfair text-4xl text-white mb-2 leading-tight">Hayalinizdeki Evi{"\n"}Yaratın.</Text>
                <Text className="text-white/90 text-xs font-inter leading-relaxed max-w-[85%]">
                  DekoHome ailesine katılarak size özel koleksiyonları keşfedin ve yaşam alanınızı dönüştürmeye hemen başlayın.
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* Form Section */}
          <View className="flex-1 w-full md:w-[55%] p-8 bg-[#FAFAF9] -mt-6 md:mt-0 rounded-t-[32px] md:rounded-t-none md:justify-center">
            <View className="max-w-md w-full mx-auto flex-1 justify-center">
              <Text className="font-playfair text-3xl text-slate-900 mb-1 mt-4 md:mt-0">Hesap Oluştur</Text>
              <Text className="text-slate-500 text-xs font-inter mb-8">
                DekoHome'a kaydolmak için bilgilerinizi girin
              </Text>

              {/* Ad & Soyad Row */}
              <View className="flex-row gap-4 mb-5">
                {/* Ad Input */}
                <View className="flex-1">
                  <Text className="text-[10px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px] uppercase">Ad</Text>
                  <Controller
                    control={control}
                    name="ad"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className={`flex-row items-center border ${errors.ad ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 h-14 bg-white shadow-sm`}>
                        <User size={18} color="#94a3b8" />
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          placeholder="Ahmet"
                          placeholderTextColor="#94a3b8"
                          className="flex-1 ml-3 text-sm text-slate-900 font-inter outline-none"
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.ad && <Text className="text-red-500 text-[10px] mt-1 ml-1">{errors.ad.message}</Text>}
                </View>

                {/* Soyad Input */}
                <View className="flex-1">
                  <Text className="text-[10px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px] uppercase">Soyad</Text>
                  <Controller
                    control={control}
                    name="soyad"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className={`flex-row items-center border ${errors.soyad ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 h-14 bg-white shadow-sm`}>
                        <User size={18} color="#94a3b8" />
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          placeholder="Yılmaz"
                          placeholderTextColor="#94a3b8"
                          className="flex-1 ml-3 text-sm text-slate-900 font-inter outline-none"
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.soyad && <Text className="text-red-500 text-[10px] mt-1 ml-1">{errors.soyad.message}</Text>}
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-5">
                <Text className="text-[10px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px] uppercase">E-Posta</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className={`flex-row items-center border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 h-14 bg-white shadow-sm`}>
                      <Mail size={18} color="#94a3b8" />
                      <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        placeholder="ornek@mail.com"
                        placeholderTextColor="#94a3b8"
                        className="flex-1 ml-3 text-sm text-slate-900 font-inter outline-none"
                        value={value}
                      />
                    </View>
                  )}
                />
                {errors.email && <Text className="text-red-500 text-[10px] mt-1 ml-1">{errors.email.message}</Text>}
              </View>

              {/* Password & Password Confirm Row */}
              <View className="flex-row gap-4 mb-8">
                {/* Password Input */}
                <View className="flex-1">
                  <Text className="text-[10px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px] uppercase">Şifre</Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className={`flex-row items-center border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 h-14 bg-white shadow-sm`}>
                        <Lock size={18} color="#94a3b8" />
                        <TextInput
                          secureTextEntry
                          onBlur={onBlur}
                          onChangeText={onChange}
                          placeholder="••••••••"
                          placeholderTextColor="#94a3b8"
                          className="flex-1 mx-2 text-sm text-slate-900 font-inter outline-none"
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.password && <Text className="text-red-500 text-[10px] mt-1 ml-1">{errors.password.message}</Text>}
                </View>

                {/* Password Confirm Input */}
                <View className="flex-1">
                  <Text className="text-[10px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px] uppercase">Şifre Tekrar</Text>
                  <Controller
                    control={control}
                    name="passwordConfirm"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className={`flex-row items-center border ${errors.passwordConfirm ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 h-14 bg-white shadow-sm`}>
                        <Lock size={18} color="#94a3b8" />
                        <TextInput
                          secureTextEntry
                          onBlur={onBlur}
                          onChangeText={onChange}
                          placeholder="••••••••"
                          placeholderTextColor="#94a3b8"
                          className="flex-1 mx-2 text-sm text-slate-900 font-inter outline-none"
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.passwordConfirm && <Text className="text-red-500 text-[10px] mt-1 ml-1">{errors.passwordConfirm.message}</Text>}
                </View>
              </View>

              {/* Register Button */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className={`h-14 rounded-[16px] bg-yellow-600 border-b-4 border-yellow-700 flex-row items-center justify-center shadow-lg shadow-yellow-600/30 active:translate-y-1 active:border-b-0 mb-8 ${isSubmitting ? 'opacity-70' : ''}`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-base font-inter-bold">Şimdi Kaydol</Text>
                )}
              </Pressable>

              {/* Social Logins */}
              <View>
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-[1px] bg-slate-200" />
                  <Text className="mx-4 text-slate-400 text-[10px] font-inter-bold tracking-widest text-center uppercase">
                    Veya Şununla Kaydolun
                  </Text>
                  <View className="flex-1 h-[1px] bg-slate-200" />
                </View>

                <View className="flex-row gap-4 mb-8">
                  <Pressable className="flex-1 h-12 rounded-[14px] border border-slate-200 flex-row items-center justify-center bg-white shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors">
                    <FontAwesome name="google" size={18} color="#747c87" />
                    <Text className="ml-2 font-inter-bold text-slate-600 text-xs">Google</Text>
                  </Pressable>
                  <Pressable className="flex-1 h-12 rounded-[14px] border border-slate-200 flex-row items-center justify-center bg-white shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors">
                    <FontAwesome name="facebook" size={18} color="#747c87" />
                    <Text className="ml-2 font-inter-bold text-slate-600 text-xs">Facebook</Text>
                  </Pressable>
                </View>
              </View>

              {/* Footer Link */}
              <View className="flex-row justify-center pb-8 mt-auto">
                <Text className="text-slate-500 font-inter text-xs">Zaten bir hesabınız var mı? </Text>
                <Link href="/(auth)/login">
                  <Text className="text-yellow-600 font-inter-bold text-xs">Buradan giriş yapın</Text>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

