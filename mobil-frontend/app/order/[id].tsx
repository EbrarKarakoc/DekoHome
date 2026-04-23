import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import type { Order } from '@/types';
import { OrderStatusBadge } from '@components/order/OrderStatusBadge';
import Colors from '@constants/colors';
import { useCancelOrder, useOrder, useUpdateOrder } from '@hooks/useOrders';
import { useAuthStore } from '@store/authStore';
import { getErrorMessage } from '@utils/error';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

const CANCELABLE_STATUSES: Order['status'][] = ['Onaylandı', 'Hazırlanıyor'];
const EDITABLE_ADDRESS_STATUSES: Order['status'][] = ['Onaylandı', 'Hazırlanıyor'];

export default function OrderDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = typeof params.id === 'string' ? params.id : '';

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const orderQuery = useOrder(orderId, isAuthenticated);
  const cancelOrderMutation = useCancelOrder();
  const updateOrderMutation = useUpdateOrder();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState('');

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
  const canEditAddress = EDITABLE_ADDRESS_STATUSES.includes(order.status);

  const handleCancel = async () => {
    try {
      await cancelOrderMutation.mutateAsync(order.id ?? order._id ?? '');
      showMessage({ message: 'Siparis iptal edildi', type: 'success' });
      await orderQuery.refetch();
    } catch (error) {
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  const handleStartEditAddress = () => {
    setEditedAddress(order.address);
    setIsEditingAddress(true);
  };

  const handleCancelEditAddress = () => {
    setIsEditingAddress(false);
    setEditedAddress('');
  };

  const handleSaveAddress = async () => {
    const trimmedAddress = editedAddress.trim();
    if (trimmedAddress.length < 10) {
      showMessage({ message: 'Adres en az 10 karakter olmalidir', type: 'warning' });
      return;
    }

    try {
      await updateOrderMutation.mutateAsync({
        orderId: order.id ?? order._id ?? '',
        payload: { address: trimmedAddress },
      });
      showMessage({ message: 'Adres guncellendi', type: 'success' });
      setIsEditingAddress(false);
      setEditedAddress('');
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

        {/* Adres Alanı – Düzenlenebilir */}
        {isEditingAddress ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 13 }}>Teslimat Adresi</Text>
            <TextInput
              multiline
              numberOfLines={3}
              value={editedAddress}
              onChangeText={setEditedAddress}
              placeholder="Yeni adresi girin"
              placeholderTextColor={Colors.textMuted}
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: Colors.primary,
                borderRadius: 10,
                backgroundColor: '#FFFBEB',
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: Colors.text,
                textAlignVertical: 'top',
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                disabled={updateOrderMutation.isPending}
                onPress={handleSaveAddress}
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: Colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: updateOrderMutation.isPending ? 0.7 : 1,
                }}
              >
                {updateOrderMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Kaydet</Text>
                )}
              </Pressable>
              <Pressable
                disabled={updateOrderMutation.isPending}
                onPress={handleCancelEditAddress}
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  backgroundColor: Colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: Colors.textSecondary, fontWeight: '600', fontSize: 14 }}>Vazgec</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <Text style={{ color: Colors.textSecondary, flex: 1 }}>Adres: {order.address}</Text>
            {canEditAddress ? (
              <Pressable
                onPress={handleStartEditAddress}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: '#FEF3C7',
                  borderWidth: 1,
                  borderColor: Colors.primary,
                }}
              >
                <Text style={{ color: Colors.primaryDark, fontWeight: '700', fontSize: 12 }}>Duzenle</Text>
              </Pressable>
            ) : null}
          </View>
        )}

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
