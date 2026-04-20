import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import Colors from '@constants/colors';
import { useAuth } from '@hooks/useAuth';

const registerSchema = z
  .object({
    ad: z.string().min(2, 'Ad en az 2 karakter olmali'),
    soyad: z.string().min(2, 'Soyad en az 2 karakter olmali'),
    email: z.string().email('Gecerli bir e-posta girin'),
    password: z.string().min(6, 'Sifre en az 6 karakter olmalidir'),
    confirmPassword: z.string().min(6, 'Sifre tekrari zorunludur'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Sifreler eslesmiyor',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { handleRegister } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      ad: '',
      soyad: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await handleRegister({
      ad: values.ad,
      soyad: values.soyad,
      email: values.email,
      password: values.password,
    });
  };

  const renderInput = (
    name: keyof RegisterFormValues,
    label: string,
    secureTextEntry = false,
    autoCapitalize: 'none' | 'sentences' = 'none'
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={{ marginBottom: 14 }}>
          <Text style={{ marginBottom: 6, color: Colors.text, fontWeight: '500' }}>{label}</Text>
          <TextInput
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={secureTextEntry}
            style={{
              borderWidth: 1,
              borderColor: errors[name] ? Colors.error : Colors.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              backgroundColor: Colors.surface,
              color: Colors.text,
            }}
            value={value}
          />
          {errors[name]?.message ? (
            <Text style={{ marginTop: 6, color: Colors.error, fontSize: 12 }}>
              {String(errors[name]?.message)}
            </Text>
          ) : null}
        </View>
      )}
    />
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: Colors.background }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 8 }}>Kayit Ol</Text>
      <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 20 }}>
        Yeni DekoHome hesabinizi olusturun.
      </Text>

      {renderInput('ad', 'Ad', false, 'sentences')}
      {renderInput('soyad', 'Soyad', false, 'sentences')}
      {renderInput('email', 'E-posta')}
      {renderInput('password', 'Sifre', true)}
      {renderInput('confirmPassword', 'Sifre Tekrari', true)}

      <Pressable
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        style={{
          height: 48,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.primary,
          opacity: isSubmitting ? 0.7 : 1,
          marginTop: 6,
          marginBottom: 14,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Kayit Ol</Text>
        )}
      </Pressable>

      <Link href="/(auth)/login" style={{ color: Colors.primary, textAlign: 'center', fontWeight: '600' }}>
        Zaten hesabin var mi? Giris yap
      </Link>
    </View>
  );
}
