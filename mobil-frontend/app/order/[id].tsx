import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import type { Order } from '@/types';
import { OrderStatusBadge } from '@components/order/OrderStatusBadge';
import Colors from '@constants/colors';
import { useCancelOrder, useOrder } from '@hooks/useOrders';
import { useAuthStore } from '@store/authStore';
import { getErrorMessage } from '@utils/error';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

const CANCELABLE_STATUSES: Order['status'][] = ['Onaylandı', 'Hazırlanıyor'];

export default function OrderDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = typeof params.id === 'string' ? params.id : '';

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const orderQuery = useOrder(orderId, isAuthenticated);
  const cancelOrderMutation = useCancelOrder();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (orderQuery.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.background }}>
        <Text style={{ color: Colors.textSecondary, marginBottom: 12 }}>Siparis bulunamadi.</Text>
        <Pressable onPress={() => router.replace('/order/history')}>
          <Text style={{ color: Colors.primary, fontWeight: '700' }}>Siparislere don</Text>
        </Pressable>
      </View>
    );
  }

  const order = orderQuery.data;
  const canCancel = CANCELABLE_STATUSES.includes(order.status);

  const handleCancel = async () => {
    try {
      await cancelOrderMutation.mutateAsync(order.id ?? order._id ?? '');
      showMessage({ message: 'Siparis iptal edildi', type: 'success' });
      await orderQuery.refetch();
    } catch (error) {
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      <Pressable onPress={() => router.back()}>
        <Text style={{ color: Colors.primary, fontWeight: '700' }}>Geri</Text>
      </Pressable>

      <Text style={{ marginTop: 10, fontSize: 24, fontWeight: '700', color: Colors.text }}>Siparis Detayi</Text>

      <View
        style={{
          marginTop: 12,
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: 14,
          backgroundColor: Colors.surface,
          padding: 12,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: Colors.text, fontWeight: '700' }}>#{(order.id ?? order._id ?? '').slice(-6).toUpperCase()}</Text>
          <OrderStatusBadge status={order.status} />
        </View>

        <Text style={{ color: Colors.textSecondary }}>Tarih: {formatDate(order.createdAt)}</Text>
        <Text style={{ color: Colors.textSecondary }}>Odeme: {order.paymentMethod}</Text>
        <Text style={{ color: Colors.textSecondary }}>Adres: {order.address}</Text>
        {order.note ? <Text style={{ color: Colors.textSecondary }}>Not: {order.note}</Text> : null}
      </View>

      <Text style={{ marginTop: 16, marginBottom: 8, color: Colors.text, fontWeight: '700' }}>Urunler</Text>
      <View style={{ gap: 10 }}>
        {order.items.map((item) => (
          <View
            key={item.itemId}
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              backgroundColor: Colors.surface,
              padding: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.text, fontWeight: '700' }} numberOfLines={2}>
                {item.name ?? 'Urun'}
              </Text>
              <Text style={{ marginTop: 4, color: Colors.textSecondary }}>Adet: {item.quantity}</Text>
              <Text style={{ marginTop: 4, color: Colors.textSecondary }}>Birim: {formatCurrency(item.price)}</Text>
            </View>
            <Text style={{ color: Colors.text, fontWeight: '700' }}>
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          marginTop: 14,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingTop: 10,
        }}
      >
        <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 17 }}>Toplam: {formatCurrency(order.total)}</Text>
      </View>

      {canCancel ? (
        <Pressable
          disabled={cancelOrderMutation.isPending}
          onPress={handleCancel}
          style={{
            marginTop: 16,
            height: 46,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: Colors.error,
            backgroundColor: '#FEE2E2',
            opacity: cancelOrderMutation.isPending ? 0.7 : 1,
          }}
        >
          {cancelOrderMutation.isPending ? (
            <ActivityIndicator color={Colors.error} />
          ) : (
            <Text style={{ color: Colors.error, fontWeight: '700' }}>Siparisi Iptal Et</Text>
          )}
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
