import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';

import type { CreateOrderRequest, PaymentMethod } from '@/types';
import { EmptyState } from '@components/common/EmptyState';
import { ErrorMessage } from '@components/common/ErrorMessage';
import Colors from '@constants/colors';
import { useCart } from '@hooks/useCart';
import { useCreateOrder } from '@hooks/useOrders';
import { useAuthStore } from '@store/authStore';
import { getErrorMessage } from '@utils/error';
import { formatCurrency } from '@utils/formatCurrency';
import { hapticError, hapticSuccess, hapticTap } from '@utils/haptics';

const checkoutSchema = z.object({
  address: z.string().trim().min(10, 'Adres en az 10 karakter olmali'),
  note: z.string().trim().max(500, 'Not en fazla 500 karakter olabilir').optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  cardHolder: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const PAYMENT_METHODS: PaymentMethod[] = ['Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme'];

/** Kart numarasını 4'lü gruplara ayırır (1234 5678 9012 3456) */
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

/** Son kullanma tarihini AA/YY formatına çevirir */
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

function validateCardFields(
  paymentMethod: PaymentMethod,
  cardNumber: string,
  cardExpiry: string,
  cardCvv: string,
  cardHolder: string
): string | null {
  if (paymentMethod !== 'Kredi Kartı') return null;

  const digitsOnly = cardNumber.replace(/\D/g, '');
  if (digitsOnly.length !== 16) {
    return 'Kart numarasi 16 haneli olmalidir';
  }

  const expiryDigits = cardExpiry.replace(/\D/g, '');
  if (expiryDigits.length !== 4) {
    return 'Son kullanma tarihi AA/YY formatinda olmalidir';
  }
  const month = parseInt(expiryDigits.slice(0, 2), 10);
  if (month < 1 || month > 12) {
    return 'Gecersiz ay (01-12 arasi olmali)';
  }

  const cvvDigits = cardCvv.replace(/\D/g, '');
  if (cvvDigits.length !== 3) {
    return 'CVV 3 haneli olmalidir';
  }

  if (!cardHolder.trim() || cardHolder.trim().length < 3) {
    return 'Kart uzerindeki isim en az 3 karakter olmalidir';
  }

  return null;
}

export default function CheckoutScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const cartQuery = useCart(isAuthenticated);
  const createOrderMutation = useCreateOrder();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Kredi Kartı');
  const [cardError, setCardError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: '',
      note: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardHolder: '',
    },
  });

  const cart = cartQuery.data;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (cartQuery.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (cartQuery.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 16, justifyContent: 'center' }}>
        <ErrorMessage
          message={getErrorMessage(cartQuery.error)}
          onRetry={async () => {
            await cartQuery.refetch();
          }}
        />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.background }}>
        <EmptyState
          icon="bag-handle-outline"
          title="Sepet bos"
          description="Siparis olusturmak icin sepetinize urun ekleyin."
        />
        <Pressable onPress={() => router.replace('/(tabs)/cart')}>
          <Text style={{ color: Colors.primary, fontWeight: '700', marginTop: 14 }}>Sepete don</Text>
        </Pressable>
      </View>
    );
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    // Kredi kartı seçiliyse ek validasyon
    if (paymentMethod === 'Kredi Kartı') {
      const cardValidationError = validateCardFields(
        paymentMethod,
        values.cardNumber ?? '',
        values.cardExpiry ?? '',
        values.cardCvv ?? '',
        values.cardHolder ?? ''
      );
      if (cardValidationError) {
        setCardError(cardValidationError);
        await hapticError();
        return;
      }
    }
    setCardError(null);

    const payload: CreateOrderRequest = {
      address: values.address,
      note: values.note?.trim() ? values.note.trim() : undefined,
      paymentMethod,
    };

    try {
      await hapticTap();
      const order = await createOrderMutation.mutateAsync(payload);
      await hapticSuccess();
      showMessage({ message: 'Siparisiniz olusturuldu', type: 'success' });

      const orderId = order.id ?? order._id;
      if (orderId) {
        router.replace({ pathname: '/order/[id]', params: { id: orderId } });
      } else {
        router.replace('/order/history');
      }
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  const isCardSelected = paymentMethod === 'Kredi Kartı';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      <Pressable onPress={() => router.back()}>
        <Text style={{ color: Colors.primary, fontWeight: '700' }}>Geri</Text>
      </Pressable>

      <Text style={{ marginTop: 10, fontSize: 24, fontWeight: '700', color: Colors.text }}>Siparisi Tamamla</Text>

      <View
        style={{
          marginTop: 14,
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: 14,
          backgroundColor: Colors.surface,
          padding: 12,
          gap: 8,
        }}
      >
        <Text style={{ color: Colors.text, fontWeight: '700' }}>Siparis Ozeti</Text>
        {cart.items.map((item) => (
          <View key={item.itemId} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Text style={{ color: Colors.textSecondary, flex: 1 }} numberOfLines={2}>
              {item.name} x {item.quantity}
            </Text>
            <Text style={{ color: Colors.text, fontWeight: '700' }}>{formatCurrency(item.subtotal)}</Text>
          </View>
        ))}
        <View style={{ marginTop: 6, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 }}>
          <Text style={{ color: Colors.text, fontWeight: '700' }}>Toplam: {formatCurrency(cart.total)}</Text>
        </View>
      </View>

      <Text style={{ marginTop: 18, marginBottom: 8, color: Colors.text, fontWeight: '700' }}>Teslimat Adresi</Text>
      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              multiline
              numberOfLines={4}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Adresinizi girin"
              placeholderTextColor={Colors.textMuted}
              style={{
                minHeight: 100,
                borderWidth: 1,
                borderColor: errors.address ? Colors.error : Colors.border,
                borderRadius: 12,
                backgroundColor: Colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: Colors.text,
                textAlignVertical: 'top',
              }}
            />
            {errors.address ? <Text style={{ marginTop: 6, color: Colors.error, fontSize: 12 }}>{errors.address.message}</Text> : null}
          </View>
        )}
      />

      <Text style={{ marginTop: 16, marginBottom: 8, color: Colors.text, fontWeight: '700' }}>Odeme Yontemi</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {PAYMENT_METHODS.map((method) => {
          const selected = paymentMethod === method;
          return (
            <Pressable
              key={method}
              onPress={() => {
                setPaymentMethod(method);
                setCardError(null);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: selected ? Colors.primary : Colors.border,
                backgroundColor: selected ? '#FEF3C7' : Colors.surface,
              }}
            >
              <Text style={{ color: selected ? Colors.primaryDark : Colors.text }}>{method}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Kredi Kartı Bilgileri Formu */}
      {isCardSelected ? (
        <View
          style={{
            marginTop: 14,
            borderWidth: 1,
            borderColor: Colors.primary,
            borderRadius: 14,
            backgroundColor: '#FFFBEB',
            padding: 14,
            gap: 12,
          }}
        >
          <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 15 }}>Kart Bilgileri</Text>

          {cardError ? (
            <View style={{ backgroundColor: '#FEE2E2', borderRadius: 8, padding: 10 }}>
              <Text style={{ color: Colors.error, fontSize: 13 }}>{cardError}</Text>
            </View>
          ) : null}

          <View>
            <Text style={{ color: Colors.textSecondary, fontSize: 13, marginBottom: 6 }}>Kart Numarasi</Text>
            <Controller
              control={control}
              name="cardNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(formatCardNumber(text))}
                  value={value}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={19}
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.border,
                    borderRadius: 10,
                    backgroundColor: Colors.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: Colors.text,
                    fontSize: 16,
                    letterSpacing: 1,
                  }}
                />
              )}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 13, marginBottom: 6 }}>Son Kullanma Tarihi</Text>
              <Controller
                control={control}
                name="cardExpiry"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(formatExpiry(text))}
                    value={value}
                    placeholder="AA/YY"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={5}
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border,
                      borderRadius: 10,
                      backgroundColor: Colors.surface,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: Colors.text,
                      fontSize: 16,
                    }}
                  />
                )}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 13, marginBottom: 6 }}>CVV</Text>
              <Controller
                control={control}
                name="cardCvv"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 3))}
                    value={value}
                    placeholder="000"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border,
                      borderRadius: 10,
                      backgroundColor: Colors.surface,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: Colors.text,
                      fontSize: 16,
                    }}
                  />
                )}
              />
            </View>
          </View>

          <View>
            <Text style={{ color: Colors.textSecondary, fontSize: 13, marginBottom: 6 }}>Kart Uzerindeki Isim</Text>
            <Controller
              control={control}
              name="cardHolder"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ad Soyad"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.border,
                    borderRadius: 10,
                    backgroundColor: Colors.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: Colors.text,
                    fontSize: 16,
                  }}
                />
              )}
            />
          </View>
        </View>
      ) : null}

      <Text style={{ marginTop: 16, marginBottom: 8, color: Colors.text, fontWeight: '700' }}>Siparis Notu (Opsiyonel)</Text>
      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Not ekleyebilirsiniz"
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
        )}
      />

      <Pressable
        disabled={isSubmitting || createOrderMutation.isPending}
        onPress={handleSubmit(onSubmit)}
        style={{
          marginTop: 22,
          height: 48,
          borderRadius: 12,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isSubmitting || createOrderMutation.isPending ? 0.7 : 1,
        }}
      >
        {isSubmitting || createOrderMutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Siparisi Olustur</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
