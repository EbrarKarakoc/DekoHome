import { Plus, Edit2, Trash2, Search, Filter, ChevronLeft, ChevronRight, Package } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
  Alert,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';

import Colors from '@constants/colors';
import { useInfiniteProducts } from '@hooks/useProducts';
import type { Product } from '@/types';
import { getErrorMessage } from '@utils/error';
import { formatCurrency } from '@utils/formatCurrency';

export default function AdminProductsScreen() {
  const [search, setSearch] = useState('');
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefetching,
    refetch
  } = useInfiniteProducts({ q: search || undefined, limit: 10 });

  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.products) ?? [];
  }, [data]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Ürünü Sil',
      `${name} isimli ürünü silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => showMessage({ message: 'Silme işlemi backend bağlantısı bekliyor', type: 'info' })
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
      }}
    >
      <Image
        source={{ uri: item.imageUrl || (item.images && item.images[0]) || 'https://placehold.co/100x100/png' }}
        style={{ width: 60, height: 60, borderRadius: 10, backgroundColor: Colors.surfaceAlt }}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
          Stok: {item.stock} | {formatCurrency(item.price)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}
        >
          <Edit2 size={16} color={Colors.primary} />
        </Pressable>
        <Pressable
          onPress={() => handleDelete((item.id ?? item._id)!, item.name)}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}
        >
          <Trash2 size={16} color="#DC2626" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Search Header */}
      <View style={{ padding: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: 12, paddingHorizontal: 12, height: 44 }}>
            <Search size={18} color={Colors.textMuted} />
            <TextInput
              placeholder="Ürün ara..."
              value={search}
              onChangeText={setSearch}
              style={{ flex: 1, marginLeft: 8, fontSize: 14, color: Colors.text }}
            />
          </View>
          <Pressable
            style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item, index) => item.id ?? item._id ?? `ap-${index}`}
        renderItem={renderProductItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Package size={48} color={Colors.border} />
              <Text style={{ marginTop: 12, color: Colors.textSecondary }}>Ürün bulunamadı</Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={Colors.primary} style={{ padding: 20 }} />
          ) : null
        }
      />
    </View>
  );
}
