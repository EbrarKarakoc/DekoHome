import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import Colors from '@constants/colors';
import { useAuth } from '@hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Gecerli bir e-posta girin'),
  password: z.string().min(6, 'Sifre en az 6 karakter olmalidir'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { handleLogin } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await handleLogin(values);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: Colors.background }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 8 }}>Giris Yap</Text>
      <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 24 }}>
        DekoHome hesabinizla devam edin.
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 6, color: Colors.text, fontWeight: '500' }}>E-posta</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="ornek@mail.com"
              placeholderTextColor={Colors.textMuted}
              style={{
                borderWidth: 1,
                borderColor: errors.email ? Colors.error : Colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                backgroundColor: Colors.surface,
                color: Colors.text,
              }}
              value={value}
            />
            {errors.email ? (
              <Text style={{ marginTop: 6, color: Colors.error, fontSize: 12 }}>{errors.email.message}</Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ marginBottom: 6, color: Colors.text, fontWeight: '500' }}>Sifre</Text>
            <TextInput
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="******"
              placeholderTextColor={Colors.textMuted}
              style={{
                borderWidth: 1,
                borderColor: errors.password ? Colors.error : Colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                backgroundColor: Colors.surface,
                color: Colors.text,
              }}
              value={value}
            />
            {errors.password ? (
              <Text style={{ marginTop: 6, color: Colors.error, fontSize: 12 }}>{errors.password.message}</Text>
            ) : null}
          </View>
        )}
      />

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
          marginBottom: 16,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Giris Yap</Text>
        )}
      </Pressable>

      <Link href="/(auth)/register" style={{ color: Colors.primary, textAlign: 'center', fontWeight: '600' }}>
        Hesabin yok mu? Kayit ol
      </Link>
    </View>
  );
}
