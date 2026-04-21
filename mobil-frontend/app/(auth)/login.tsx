import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, ChevronRight, Home, EyeOff, Eye } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
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
  GestureResponderEvent,
} from 'react-native';
import { z } from 'zod';
import { useState } from 'react';

import { useAuth } from '@hooks/useAuth';
import LoginCharacters from '@components/auth/LoginCharacters';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { handleLogin } = useAuth();
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'passwordVisible' | 'error' | 'success'>('idle');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await handleLogin(values);
      setStatus('success');
      // Adding a slight delay to show the happy animation before navigating or refreshing
    } catch (e) {
      setStatus('error');
    }
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    setTouchPos({
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    });
  };

  const handlePasswordFocus = () => {
    if (isPasswordVisible) {
      setStatus('passwordVisible');
    }
  };

  const togglePasswordVisibility = () => {
    const newState = !isPasswordVisible;
    setIsPasswordVisible(newState);
    setStatus(newState ? 'passwordVisible' : 'idle');
  };

  // When form validation fails
  const onValidationError = () => {
    setStatus('error');
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: '#FAFAF9' }}
      onStartShouldSetResponder={() => true}
      onResponderMove={handleTouchMove}
      onResponderRelease={() => setTouchPos(null)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Characters Section */}
          <View className="pt-16 pb-6 bg-[#FAFAF9] items-center">
            <View className="flex-row items-center gap-2 mb-4">
              <Home size={28} color="#D48806" />
              <Text className="text-slate-900 text-2xl font-playfair tracking-tight">DekoHome</Text>
            </View>

            {/* Character Panel */}
            <LoginCharacters touchPos={touchPos} status={status} />
          </View>

          {/* Form Section */}
          <View className="flex-1 p-8 bg-white rounded-t-[40px] shadow-lg shadow-slate-200 border-t border-slate-100">
            <Text className="font-playfair text-3xl text-slate-900 mb-2">Tekrar Hoş Geldiniz!</Text>
            <Text className="text-slate-500 text-sm font-inter mb-8">
              Lütfen giriş bilgilerinizi girin.
            </Text>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-[10px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px]">E-POSTA ADRESİ</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className={`flex-row items-center border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 h-14 bg-slate-50 focus:bg-white focus:border-slate-300 transition-colors`}>
                    <Mail size={20} color="#94a3b8" />
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      onBlur={() => {
                        onBlur();
                        setStatus('idle');
                      }}
                      onChangeText={(text) => {
                        onChange(text);
                        if (status === 'error') setStatus('idle');
                      }}
                      onFocus={() => setStatus('idle')}
                      placeholder="ornek@mail.com"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 ml-3 text-base text-slate-900 font-inter"
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-3">
              <Text className="text-[10px] font-inter-bold text-slate-400 mb-2 tracking-[1.5px]">ŞİFRE</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className={`flex-row items-center border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 h-14 bg-slate-50 focus:bg-white focus:border-slate-300 transition-colors`}>
                    <Lock size={20} color="#94a3b8" />
                    <TextInput
                      secureTextEntry={!isPasswordVisible}
                      onBlur={() => {
                        onBlur();
                        setStatus('idle');
                      }}
                      onFocus={handlePasswordFocus}
                      onChangeText={(text) => {
                        onChange(text);
                        if (status === 'error') setStatus('idle');
                      }}
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 mx-3 text-base text-slate-900 font-inter"
                      value={value}
                    />
                    <Pressable onPress={togglePasswordVisibility} className="p-2">
                      {isPasswordVisible ? (
                        <EyeOff size={20} color="#94a3b8" />
                      ) : (
                        <Eye size={20} color="#94a3b8" />
                      )}
                    </Pressable>
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <View className="flex-row justify-end mb-8">
              <Pressable>
                <Text className="text-primary-600 font-inter-bold text-sm">Şifremi Unuttum</Text>
              </Pressable>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleSubmit(onSubmit, onValidationError)}
              disabled={isSubmitting}
              className={`h-14 rounded-full bg-slate-900 flex-row items-center justify-center shadow-lg shadow-black/20 mb-6 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-inter-bold">Giriş Yap</Text>
              )}
            </Pressable>

            {/* Social Logins */}
            <View className="flex-row gap-4">
              <Pressable className="flex-1 h-14 rounded-2xl border border-slate-200 flex-row items-center justify-center bg-white shadow-sm">
                <FontAwesome name="google" size={20} color="#EA4335" />
                <Text className="ml-3 font-inter-bold text-slate-700">Google</Text>
              </Pressable>
              <Pressable className="flex-1 h-14 rounded-2xl border border-slate-200 flex-row items-center justify-center bg-white shadow-sm">
                <FontAwesome name="facebook" size={20} color="#1877F2" />
                <Text className="ml-3 font-inter-bold text-slate-700">Facebook</Text>
              </Pressable>
            </View>

            {/* Footer Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500 font-inter">Hesabınız yok mu? </Text>
              <Link href="/(auth)/register">
                <Text className="text-primary-600 font-inter-bold">Kayıt Ol</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

