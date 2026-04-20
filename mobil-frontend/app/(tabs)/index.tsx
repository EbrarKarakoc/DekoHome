import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { EmptyState } from '@components/common/EmptyState';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { CategoryChip } from '@components/layout/CategoryChip';
import { ProductCard } from '@components/product/ProductCard';
import { ProductSkeleton } from '@components/product/ProductSkeleton';
import Colors from '@constants/colors';
import { useCategories } from '@hooks/useCategories';
import { useProducts } from '@hooks/useProducts';
import type { Category } from '@/types';
import { getErrorMessage } from '@utils/error';

function flattenCategories(items: Category[]): Category[] {
  const output: Category[] = [];

  for (const item of items) {
    output.push(item);
    if (item.children?.length) {
      output.push(...flattenCategories(item.children));
    }
  }

  return output;
}

export default function TabsHomeScreen() {
  const categoriesQuery = useCategories();
  const productsQuery = useProducts({ limit: 6 });

  const categories = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []).filter((item) => !!(item.id ?? item._id)),
    [categoriesQuery.data]
  );

  const products = productsQuery.data?.products ?? [];

  const isLoading = categoriesQuery.isLoading || productsQuery.isLoading;
  const isRefreshing = categoriesQuery.isRefetching || productsQuery.isRefetching;

  const onRefresh = async () => {
    await Promise.all([categoriesQuery.refetch(), productsQuery.refetch()]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 16, gap: 12 }}>
        <View style={{ height: 16, width: 160, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ height: 34, width: 92, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
          <View style={{ height: 34, width: 84, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
          <View style={{ height: 34, width: 104, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <ProductSkeleton />
          <ProductSkeleton />
        </View>
      </View>
    );
  }

  if (categoriesQuery.isError || productsQuery.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 16, justifyContent: 'center' }}>
        <ErrorMessage
          message={getErrorMessage(categoriesQuery.error ?? productsQuery.error)}
          onRetry={async () => {
            await onRefresh();
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
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 26, fontWeight: '700', color: Colors.text }}>DekoHome</Text>
            <Text style={{ marginTop: 4, color: Colors.textSecondary }}>
              One cikan urunleri ve kategorileri kesfedin.
            </Text>

            <Text style={{ marginTop: 16, marginBottom: 10, color: Colors.text, fontWeight: '700' }}>
              Kategoriler
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 10 }}
            >
              {categories.map((category) => {
                const categoryId = category.id ?? category._id;
                if (!categoryId) return null;

                return (
                  <CategoryChip
                    key={categoryId}
                    label={category.name}
                    onPress={() => router.push(`/category/${categoryId}`)}
                  />
                );
              })}
            </ScrollView>

            <View style={{ marginTop: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: Colors.text, fontWeight: '700' }}>One Cikan Urunler</Text>
              <Pressable onPress={() => router.push('/tabs/search')}>
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>Tumunu goster</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="storefront-outline" title="Urun bulunamadi" description="Su an gosterilecek urun yok." />
        }
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}
