import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { EmptyState } from '@components/common/EmptyState';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { CategoryChip } from '@components/layout/CategoryChip';
import { ProductCard } from '@components/product/ProductCard';
import { ProductSkeleton } from '@components/product/ProductSkeleton';
import Colors from '@constants/colors';
import { useCategories } from '@hooks/useCategories';
import { useInfiniteProducts } from '@hooks/useProducts';
import type { Category, ProductFilters } from '@/types';
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

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [minPriceText, setMinPriceText] = useState('');
  const [maxPriceText, setMaxPriceText] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const categoriesQuery = useCategories();

  const filters = useMemo<Omit<ProductFilters, 'page'>>(() => {
    const minPrice = minPriceText ? Number(minPriceText) : undefined;
    const maxPrice = maxPriceText ? Number(maxPriceText) : undefined;

    return {
      q: debouncedQuery || undefined,
      categoryId: selectedCategoryId,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    };
  }, [debouncedQuery, selectedCategoryId, minPriceText, maxPriceText]);

  const productsQuery = useInfiniteProducts(filters);

  const categories = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []).filter((item) => !!(item.id ?? item._id)),
    [categoriesQuery.data]
  );

  const products = productsQuery.data?.pages.flatMap((page) => page.products) ?? [];
  const totalResults = productsQuery.data?.pages[0]?.pagination.total ?? products.length;

  const isLoading = productsQuery.isLoading;
  const isRefreshing = productsQuery.isRefetching || categoriesQuery.isRefetching;

  const onRefresh = async () => {
    await Promise.all([categoriesQuery.refetch(), productsQuery.refetch()]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 16, gap: 12 }}>
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
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        data={products}
        keyExtractor={(item) => item.id ?? item._id ?? item.name}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.text }}>Kesfet</Text>
            <Text style={{ marginTop: 4, color: Colors.textSecondary }}>Urun ara ve filtrele.</Text>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Urun ara"
              placeholderTextColor={Colors.textMuted}
              style={{
                marginTop: 14,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                backgroundColor: Colors.surface,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: Colors.text,
              }}
              value={query}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TextInput
                keyboardType="numeric"
                onChangeText={setMinPriceText}
                placeholder="Min fiyat"
                placeholderTextColor={Colors.textMuted}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 12,
                  backgroundColor: Colors.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: Colors.text,
                }}
                value={minPriceText}
              />
              <TextInput
                keyboardType="numeric"
                onChangeText={setMaxPriceText}
                placeholder="Max fiyat"
                placeholderTextColor={Colors.textMuted}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 12,
                  backgroundColor: Colors.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: Colors.text,
                }}
                value={maxPriceText}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, marginTop: 12, paddingBottom: 4 }}
            >
              <CategoryChip
                label="Tum Kategoriler"
                selected={!selectedCategoryId}
                onPress={() => setSelectedCategoryId(undefined)}
              />
              {categories.map((category) => {
                const categoryId = category.id ?? category._id;
                if (!categoryId) return null;

                return (
                  <CategoryChip
                    key={categoryId}
                    label={category.name}
                    selected={selectedCategoryId === categoryId}
                    onPress={() => setSelectedCategoryId(categoryId)}
                  />
                );
              })}
            </ScrollView>

            <Text style={{ marginTop: 14, marginBottom: 10, color: Colors.textSecondary }}>
              {totalResults} sonuc bulundu
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="search-outline" title="Sonuc bulunamadi" description="Filtrelere uygun urun yok." />
        }
        ListFooterComponent={
          productsQuery.isFetchingNextPage ? (
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
            productsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}
