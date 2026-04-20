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
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const PAYMENT_METHODS: PaymentMethod[] = ['Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme'];

export default function CheckoutScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const cartQuery = useCart(isAuthenticated);
  const createOrderMutation = useCreateOrder();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Kredi Kartı');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: '',
      note: '',
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
              onPress={() => setPaymentMethod(method)}
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
