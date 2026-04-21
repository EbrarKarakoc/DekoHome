import { useRouter } from 'expo-router';
import { Search, ShoppingBag, Bell, ChevronRight, Sparkles, User } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  Platform,
} from 'react-native';

import CategoryChip from '@components/layout/CategoryChip';
import ProductCard from '@components/product/ProductCard';
import HeroSlider from '@components/layout/HeroSlider';
import CategoryGrid from '@components/layout/CategoryGrid';
import Footer from '@components/layout/Footer';
import WebHeader from '@components/layout/WebHeader';
import { useCategories } from '@hooks/useCategories';
import { useInfiniteProducts } from '@hooks/useProducts';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefetching,
    refetch,
  } = useInfiniteProducts({
    categoryId: selectedCategoryId || undefined,
    limit: 10,
  });

  const products = useMemo(() => {
    return productsData?.pages.flatMap((page) => page.products) ?? [];
  }, [productsData]);

  const renderHeader = () => (
    <View className="bg-white">
      <WebHeader />

      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Categories Grid Section */}
      <CategoryGrid />

      {/* Featured Products Header */}
      <View className="px-6 mb-8 mt-4 items-center">
        <Text className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Öne Çıkan Ürünler</Text>
        <View className="h-1 w-16 bg-[#D48806] rounded-full mt-3" />
      </View>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={Platform.OS === 'web' ? ({ flex: 1, height: '100vh', display: 'flex' } as any) : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={products}
        keyExtractor={(item, index) => item.id ?? item._id ?? String(index)}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 16 }}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 40 : 0 }}
        style={Platform.OS === 'web' ? ({ flex: 1, overflowY: 'auto' } as any) : undefined}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#D48806" />
        }
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          <>
            {isFetchingNextPage && <ActivityIndicator className="py-8" color="#D48806" />}
            {!hasNextPage && products.length > 0 && <Footer />}
          </>
        }
        ListEmptyComponent={
          !isProductsLoading ? (
            <View className="flex-1 items-center justify-center py-20 bg-slate-50 mx-6 rounded-3xl border border-dashed border-slate-200">
              <Text className="text-slate-400 font-inter">Henüz ürün bulunamadı.</Text>
            </View>
          ) : (
            <ActivityIndicator className="mt-20" color="#D48806" />
          )
        }
      />
    </SafeAreaView>
  );
}

