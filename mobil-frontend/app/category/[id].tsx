import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { EmptyState } from '@components/common/EmptyState';
import { ErrorMessage } from '@components/common/ErrorMessage';
import ProductCard from '@components/product/ProductCard';
import { ProductSkeleton } from '@components/product/ProductSkeleton';
import Colors from '@constants/colors';
import { useCategories } from '@hooks/useCategories';
import { useProducts } from '@hooks/useProducts';
import { getErrorMessage } from '@utils/error';

export default function CategoryProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const categoryId = typeof params.id === 'string' ? params.id : '';

  const categoriesQuery = useCategories();
  const productsQuery = useProducts({ categoryId, limit: 100 });

  const categoryName = useMemo(() => {
    const categories = categoriesQuery.data ?? [];

    const queue = [...categories];
    while (queue.length) {
      const current = queue.shift();
      if (!current) continue;

      const currentId = current.id ?? current._id;
      if (currentId === categoryId) {
        return current.name;
      }

      if (current.children?.length) {
        queue.push(...current.children);
      }
    }

    return 'Kategori';
  }, [categoriesQuery.data, categoryId]);

  const products = productsQuery.data?.products ?? [];

  if (productsQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <ProductSkeleton />
          <ProductSkeleton />
        </View>
      </View>
    );
  }

  if (productsQuery.isError || categoriesQuery.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 16, justifyContent: 'center' }}>
        <ErrorMessage
          message={getErrorMessage(productsQuery.error ?? categoriesQuery.error)}
          onRetry={async () => {
            await Promise.all([productsQuery.refetch(), categoriesQuery.refetch()]);
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        data={products}
        keyExtractor={(item) => item.id ?? item._id ?? item.name}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Pressable onPress={() => router.back()} style={{ marginBottom: 10 }}>
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>Geri</Text>
            </Pressable>
            <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.text }}>{categoryName}</Text>
            <Text style={{ marginTop: 4, color: Colors.textSecondary }}>{products.length} urun listeleniyor</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="albums-outline" title="Bu kategoride urun yok" description="Baska bir kategori deneyebilirsiniz." />
        }
        refreshControl={
          <RefreshControl
            refreshing={productsQuery.isRefetching || categoriesQuery.isRefetching}
            onRefresh={async () => {
              await Promise.all([productsQuery.refetch(), categoriesQuery.refetch()]);
            }}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}
