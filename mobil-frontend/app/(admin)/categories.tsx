import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';

import Colors from '@constants/colors';
import { useCategories } from '@hooks/useCategories';
import type { Category } from '@/types';
import { getErrorMessage } from '@utils/error';

export default function AdminCategoriesScreen() {
  const { data: categories = [], isLoading, isRefetching, refetch } = useCategories();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const renderCategoryItem = (item: Category, level: number = 0) => (
    <View key={item.id ?? item._id}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.surface,
          padding: 16,
          paddingLeft: 16 + level * 20,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        <View style={{ width: 24 }}>
          {item.children && item.children.length > 0 ? (
            <ChevronDown size={18} color={Colors.textMuted} />
          ) : (
            <View style={{ width: 18 }} />
          )}
        </View>
        <Text style={{ flex: 1, color: Colors.text, fontWeight: level === 0 ? '700' : '500' }}>
          {item.name}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => {
              setEditingCategory(item);
              setModalVisible(true);
            }}
            style={{ padding: 4 }}
          >
            <Edit2 size={18} color={Colors.primary} />
          </Pressable>
          <Pressable style={{ padding: 4 }}>
            <Trash2 size={18} color={Colors.error} />
          </Pressable>
        </View>
      </View>
      {item.children?.map((child) => renderCategoryItem(child, level + 1))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '600' }}>
          HİYERARŞİK LİSTE
        </Text>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
          }}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', marginLeft: 4, fontWeight: '700', fontSize: 13 }}>Yeni Ekle</Text>
        </Pressable>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={{ borderTopWidth: 1, borderTopColor: Colors.border }}>
            {categories.map((cat) => renderCategoryItem(cat))}
          </View>
        )}
      </ScrollView>

      {/* Edit Modal (Placeholder) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: Colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 20 }}>
              Kategori Düzenle
            </Text>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 }}>KATEGORİ ADI</Text>
              <TextInput
                defaultValue={editingCategory?.name}
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 12,
                  padding: 14,
                  backgroundColor: Colors.surfaceAlt,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontWeight: '700', color: Colors.textSecondary }}>İptal</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  showMessage({ message: 'Güncelleme fonksiyonu backend bağlantısı bekliyor', type: 'info' });
                  setModalVisible(false);
                }}
                style={{ flex: 1, height: 50, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Kaydet</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
