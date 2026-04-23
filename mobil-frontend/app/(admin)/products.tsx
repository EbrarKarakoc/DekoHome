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
  Modal,
  Platform,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';

import Colors from '@constants/colors';
import { useInfiniteProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@hooks/useProducts';
import { useCategories } from '@hooks/useCategories';
import type { Product } from '@/types';
import { getErrorMessage } from '@utils/error';
import { formatCurrency } from '@utils/formatCurrency';

export default function AdminProductsScreen() {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { data: categoriesData } = useCategories();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const isPending = isCreating || isUpdating;

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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(String(product.price));
    setStock(String(product.stock));
    setCategoryId(product.categoryId || '');
    setImageUrl(product.imageUrl || '');
    setModalVisible(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategoryId('');
    setImageUrl('');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name || !price || !categoryId) {
      showMessage({ message: 'Lütfen zorunlu alanları doldurun', type: 'warning' });
      return;
    }

    const payload = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      categoryId,
      imageUrl,
      images: [imageUrl],
    };

    if (editingProduct) {
      const productId = editingProduct.id || editingProduct._id;
      if (!productId) return;

      updateProduct({ id: productId, data: payload }, {
        onSuccess: () => {
          showMessage({ message: 'Ürün başarıyla güncellendi', type: 'success' });
          setModalVisible(false);
        },
        onError: (err) => showMessage({ message: getErrorMessage(err), type: 'danger' })
      });
    } else {
      createProduct(payload, {
        onSuccess: () => {
          showMessage({ message: 'Ürün başarıyla eklendi', type: 'success' });
          setModalVisible(false);
        },
        onError: (err) => showMessage({ message: getErrorMessage(err), type: 'danger' })
      });
    }
  };

  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const executeDelete = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id, {
      onSuccess: () => {
        showMessage({ message: 'Ürün başarıyla silindi', type: 'success' });
        setProductToDelete(null);
      },
      onError: (err) => {
        const errorMsg = getErrorMessage(err);
        if (errorMsg.includes('aktif bir siparişte')) {
          if (Platform.OS === 'web') {
            window.alert('Silme Engellendi: ' + errorMsg);
          } else {
            Alert.alert('Silme Engellendi', errorMsg);
          }
        } else {
          showMessage({ message: errorMsg, type: 'danger' });
        }
        setProductToDelete(null);
      }
    });
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
          onPress={() => handleEdit(item)}
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
            onPress={handleAddNew}
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
      {/* Add Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: Colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 20 }}>
              {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 }}>ÜRÜN ADI</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Ürün ismini girin"
                    style={modalInputStyle}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 }}>AÇIKLAMA</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    placeholder="Ürün detaylarını girin"
                    style={[modalInputStyle, { height: 100, textAlignVertical: 'top' }]}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 }}>FİYAT (₺)</Text>
                    <TextInput
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                      placeholder="0.00"
                      style={modalInputStyle}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 }}>STOK</Text>
                    <TextInput
                      value={stock}
                      onChangeText={setStock}
                      keyboardType="numeric"
                      placeholder="0"
                      style={modalInputStyle}
                    />
                  </View>
                </View>

                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 }}>KATEGORİ</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {categoriesData?.map(cat => {
                      const catId = cat.id || cat._id;
                      const isSelected = categoryId === catId;
                      return (
                        <Pressable
                          key={catId}
                          onPress={() => setCategoryId(catId || '')}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                            backgroundColor: isSelected ? Colors.primary : Colors.surfaceAlt,
                            borderWidth: 1,
                            borderColor: isSelected ? Colors.primary : Colors.border,
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: '600', color: isSelected ? '#FFFFFF' : Colors.textSecondary }}>
                            {cat.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                  {categoriesData?.length === 0 && (
                    <Text style={{ fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' }}>Kategori bulunamadı</Text>
                  )}
                </View>

                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 }}>GÖRSEL URL</Text>
                  <TextInput
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    placeholder="https://example.com/image.jpg"
                    style={modalInputStyle}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontWeight: '700', color: Colors.textSecondary }}>Vazgeç</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={isPending}
                style={{ flex: 1, height: 50, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', opacity: isPending ? 0.7 : 1 }}
              >
                {isPending ? <ActivityIndicator color="#FFF" /> : <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>{editingProduct ? 'Güncelle' : 'Oluştur'}</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={!!productToDelete} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 }}>
              Ürünü Sil
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 24, lineHeight: 20 }}>
              <Text style={{ fontWeight: '600', color: Colors.text }}>{productToDelete?.name}</Text> isimli ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setProductToDelete(null)}
                style={{ flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontWeight: '700', color: Colors.textSecondary }}>Vazgeç</Text>
              </Pressable>
              <Pressable
                onPress={executeDelete}
                style={{ flex: 1, height: 46, borderRadius: 12, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Sil</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const modalInputStyle = {
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: 12,
  padding: 14,
  backgroundColor: Colors.surfaceAlt,
  color: Colors.text,
  fontSize: 14,
};
