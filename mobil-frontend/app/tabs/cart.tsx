import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { CartItem } from '@components/cart/CartItem';
import { EmptyState } from '@components/common/EmptyState';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { ListSkeleton } from '@components/common/ListSkeleton';
import Colors from '@constants/colors';
import { useCart, useRemoveFromCart, useUpdateCartItemQuantity } from '@hooks/useCart';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import { getErrorMessage } from '@utils/error';
import { formatCurrency } from '@utils/formatCurrency';
import { hapticError, hapticSuccess, hapticTap } from '@utils/haptics';

export default function CartScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setCart = useCartStore((state) => state.setCart);

  const cartQuery = useCart(isAuthenticated);
  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeFromCartMutation = useRemoveFromCart();

  useEffect(() => {
    if (cartQuery.data) {
      setCart(cartQuery.data);
    }
  }, [cartQuery.data, setCart]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (cartQuery.isLoading) {
    return <ListSkeleton rows={5} />;
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

  const cart = cartQuery.data;
  const items = cart?.items ?? [];

  const isMutating = updateQuantityMutation.isPending || removeFromCartMutation.isPending;

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    try {
      await hapticTap();
      await updateQuantityMutation.mutateAsync({ itemId, quantity });
      await hapticSuccess();
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await hapticTap();
      await removeFromCartMutation.mutateAsync(itemId);
      await hapticSuccess();
      showMessage({ message: 'Urun sepetten kaldirildi', type: 'success' });
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.itemId}
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={cartQuery.isRefetching}
            onRefresh={async () => {
              await cartQuery.refetch();
            }}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 26, fontWeight: '700', color: Colors.text }}>Sepetim</Text>
            <Text style={{ marginTop: 4, color: Colors.textSecondary }}>{items.length} urun</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="bag-outline" title="Sepetiniz bos" description="Begendiginiz urunleri sepete ekleyebilirsiniz." />
        }
        ListFooterComponent={
          items.length > 0 ? (
            <View
              style={{
                marginTop: 14,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 14,
                backgroundColor: Colors.surface,
                padding: 14,
              }}
            >
              <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 17 }}>
                Toplam: {formatCurrency(cart?.total ?? 0)}
              </Text>

              <Pressable
                disabled={isMutating}
                onPress={() => router.push('/order/checkout')}
                style={{
                  marginTop: 12,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: Colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isMutating ? 0.7 : 1,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Siparisi Tamamla</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <CartItem
            item={item}
            disabled={isMutating}
            onIncrease={() => updateItemQuantity(item.itemId, item.quantity + 1)}
            onDecrease={() => updateItemQuantity(item.itemId, Math.max(1, item.quantity - 1))}
            onRemove={() => removeItem(item.itemId)}
          />
        )}
      />
    </View>
  );
}
