import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Sofa, Bed, Utensils, Briefcase, Package, Sparkles, LayoutGrid, ChevronRight } from 'lucide-react-native';

import { EmptyState } from '@components/common/EmptyState';
import { ErrorMessage } from '@components/common/ErrorMessage';
import CategoryChip from '@components/layout/CategoryChip';
import ProductCard from '@components/product/ProductCard';
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

const getIconForCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('oturma') || n.includes('misafir') || n.includes('koltuk') || n.includes('sehpa')) return Sofa;
  if (n.includes('yatak') || n.includes('gardırop')) return Bed;
  if (n.includes('mutfak')) return Utensils;
  if (n.includes('ofis')) return Briefcase;
  if (n.includes('depolama') || n.includes('dolap')) return Package;
  if (n.includes('dekorasyon') || n.includes('aydınlatma') || n.includes('aksesuar')) return Sparkles;
  return LayoutGrid;
};

const CategoryTreeItem = ({
  category,
  depth = 0,
  selectedIds,
  onToggle
}: {
  category: Category;
  depth?: number;
  selectedIds: string[];
  onToggle: (id: string) => void
}) => {
  const categoryId = category.id || category._id;
  if (!categoryId) return null;

  const isSelected = selectedIds.includes(categoryId);
  const hasChildren = category.children && category.children.length > 0;
  const Icon = getIconForCategory(category.name);

  return (
    <View style={{ marginBottom: 4 }}>
      <Pressable
        onPress={() => onToggle(categoryId)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 12,
          marginLeft: depth * 24,
          borderRadius: 10,
          backgroundColor: isSelected ? Colors.primary + '15' : 'transparent',
        }}
      >
        <View style={{
          width: depth === 0 ? 32 : 26,
          height: depth === 0 ? 32 : 26,
          borderRadius: depth === 0 ? 10 : 8,
          backgroundColor: isSelected ? Colors.primary + '25' : (depth === 0 ? '#F1F5F9' : '#F8FAFC'),
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}>
          <Icon
            size={depth === 0 ? 16 : 13}
            color={isSelected ? Colors.primary : (depth === 0 ? '#334155' : '#94A3B8')}
            strokeWidth={1.8}
          />
        </View>
        <Text style={{
          fontSize: depth === 0 ? 15 : 13,
          fontWeight: isSelected ? '700' : '500',
          color: isSelected ? Colors.primary : (depth === 0 ? Colors.text : Colors.textSecondary),
          flex: 1
        }}>
          {category.name}
        </Text>
        {hasChildren && !isSelected && (
          <ChevronRight size={14} color="#CBD5E1" />
        )}
        {isSelected && (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary }} />
        )}
      </Pressable>
      {hasChildren && category.children!.map(child => (
        <CategoryTreeItem
          key={child.id || child._id}
          category={child}
          depth={depth + 1}
          selectedIds={selectedIds}
          onToggle={onToggle}
        />
      ))}
    </View>
  );
};

export default function CategoriesScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [minPriceText, setMinPriceText] = useState('');
  const [maxPriceText, setMaxPriceText] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const categoriesQuery = useCategories();

  const categories = categoriesQuery.data ?? [];

  // Collect all descendant IDs for a given category
  const getAllDescendantIds = (category: Category): string[] => {
    const ids: string[] = [];
    const catId = category.id || category._id;
    if (catId) ids.push(catId);
    if (category.children?.length) {
      for (const child of category.children) {
        ids.push(...getAllDescendantIds(child));
      }
    }
    return ids;
  };

  // Find category by ID in the tree
  const findCategoryById = (cats: Category[], id: string): Category | null => {
    for (const cat of cats) {
      const catId = cat.id || cat._id;
      if (catId === id) return cat;
      if (cat.children?.length) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Expand selected IDs to include all children
  const expandedCategoryIds = useMemo(() => {
    const expanded = new Set<string>();
    for (const id of selectedCategoryIds) {
      const cat = findCategoryById(categories, id);
      if (cat) {
        for (const descId of getAllDescendantIds(cat)) {
          expanded.add(descId);
        }
      } else {
        expanded.add(id);
      }
    }
    return Array.from(expanded);
  }, [selectedCategoryIds, categories]);

  const filters = useMemo<Omit<ProductFilters, 'page'>>(() => {
    const minPrice = minPriceText ? Number(minPriceText) : undefined;
    const maxPrice = maxPriceText ? Number(maxPriceText) : undefined;

    return {
      q: debouncedQuery || undefined,
      categoryId: expandedCategoryIds.length > 0 ? expandedCategoryIds : undefined,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    };
  }, [debouncedQuery, expandedCategoryIds, minPriceText, maxPriceText]);

  const productsQuery = useInfiniteProducts(filters);

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

            <View style={{ marginTop: 16, backgroundColor: Colors.surface, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textMuted, marginBottom: 12, letterSpacing: 1 }}>KATEGORİ HİYERARŞİSİ</Text>

              <Pressable
                onPress={() => setSelectedCategoryIds([])}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: selectedCategoryIds.length === 0 ? Colors.primary + '15' : 'transparent',
                }}
              >
                <Text style={{
                  fontWeight: selectedCategoryIds.length === 0 ? '700' : '500',
                  color: selectedCategoryIds.length === 0 ? Colors.primary : Colors.text
                }}>
                  Tüm Kategoriler
                </Text>
              </Pressable>

              {categories.map((category) => (
                <CategoryTreeItem
                  key={category.id || category._id}
                  category={category}
                  selectedIds={selectedCategoryIds}
                  onToggle={(id) => {
                    setSelectedCategoryIds((prev) =>
                      prev.includes(id)
                        ? prev.filter((item) => item !== id)
                        : [...prev, id]
                    );
                  }}
                />
              ))}
            </View>

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
