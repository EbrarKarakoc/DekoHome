import { router, Redirect } from 'expo-router';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import type { Order } from '@/types';
import { EmptyState } from '@components/common/EmptyState';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { ListSkeleton } from '@components/common/ListSkeleton';
import Colors from '@constants/colors';
import { useCancelOrder, useOrders } from '@hooks/useOrders';
import { useAuthStore } from '@store/authStore';
import { getErrorMessage } from '@utils/error';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';
import { hapticError, hapticSuccess, hapticTap } from '@utils/haptics';
import { OrderStatusBadge } from '@components/order/OrderStatusBadge';

const CANCELABLE_STATUSES: Order['status'][] = ['Onaylandı', 'Hazırlanıyor'];

export default function OrderHistoryScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const ordersQuery = useOrders(isAuthenticated);
  const cancelOrderMutation = useCancelOrder();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (ordersQuery.isLoading) {
    return <ListSkeleton rows={4} />;
  }

  if (ordersQuery.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 16, justifyContent: 'center' }}>
        <ErrorMessage
          message={getErrorMessage(ordersQuery.error)}
          onRetry={async () => {
            await ordersQuery.refetch();
          }}
        />
      </View>
    );
  }

  const onCancel = async (orderId: string) => {
    try {
      await hapticTap();
      await cancelOrderMutation.mutateAsync(orderId);
      await hapticSuccess();
      showMessage({ message: 'Siparis iptal edildi', type: 'success' });
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  const orders = ordersQuery.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id ?? item._id ?? item.createdAt}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={ordersQuery.isRefetching}
            onRefresh={async () => {
              await ordersQuery.refetch();
            }}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: Colors.primary, fontWeight: '700' }}>Geri</Text>
            </Pressable>
            <Text style={{ marginTop: 8, fontSize: 24, fontWeight: '700', color: Colors.text }}>Siparis Gecmisi</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="receipt-outline" title="Siparisiniz bulunmuyor" description="Ilk siparisinizi verdiginizde burada gorunecek." />
        }
        renderItem={({ item }) => {
          const orderId = item.id ?? item._id ?? '';
          const canCancel = CANCELABLE_STATUSES.includes(item.status);

          return (
            <Pressable
              onPress={() => {
                if (orderId) {
                  router.push({ pathname: '/order/[id]', params: { id: orderId } });
                }
              }}
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 14,
                backgroundColor: Colors.surface,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text, fontWeight: '700' }}>#{orderId.slice(-6).toUpperCase()}</Text>
                <OrderStatusBadge status={item.status} />
              </View>

              <Text style={{ marginTop: 8, color: Colors.textSecondary }}>Tarih: {formatDate(item.createdAt)}</Text>
              <Text style={{ marginTop: 4, color: Colors.textSecondary }}>Odeme: {item.paymentMethod}</Text>
              <Text style={{ marginTop: 4, color: Colors.text, fontWeight: '700' }}>Toplam: {formatCurrency(item.total)}</Text>

              {canCancel ? (
                <Pressable
                  disabled={cancelOrderMutation.isPending}
                  onPress={() => onCancel(orderId)}
                  style={{ marginTop: 10, alignSelf: 'flex-start' }}
                >
                  <Text style={{ color: Colors.error, fontWeight: '700', opacity: cancelOrderMutation.isPending ? 0.4 : 1 }}>
                    Siparisi Iptal Et
                  </Text>
                </Pressable>
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
