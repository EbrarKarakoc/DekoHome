import { router } from 'expo-router';
import { LayoutGrid, Package, Users, ShoppingCart, ChevronRight, ArrowUpRight } from 'lucide-react-native';
import { ScrollView, Text, View, Pressable } from 'react-native';

import Colors from '@constants/colors';

export default function AdminDashboard() {
  const stats = [
    { label: 'Toplam Ürün', value: '1,240', icon: <Package size={20} color="#3B82F6" />, bg: '#EFF6FF' },
    { label: 'Kategoriler', value: '12', icon: <LayoutGrid size={20} color="#F59E0B" />, bg: '#FFFBEB' },
    { label: 'Aktif Siparişler', value: '48', icon: <ShoppingCart size={20} color="#10B981" />, bg: '#ECFDF5' },
    { label: 'Kullanıcılar', value: '850', icon: <Users size={20} color="#8B5CF6" />, bg: '#F5F3FF' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 24,
            color: Colors.text,
            marginBottom: 20,
          }}
        >
          Mağaza Özeti
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={{
                width: '48%',
                backgroundColor: Colors.surface,
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: stat.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                {stat.icon}
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.text }}>{stat.value}</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 20,
            color: Colors.text,
            marginTop: 32,
            marginBottom: 16,
          }}
        >
          Yönetim Araçları
        </Text>

        <View style={{ gap: 12 }}>
          <AdminMenuButton
            title="Kategori Yönetimi"
            description="Kategori ağacını düzenleyin ve yenilerini ekleyin"
            icon={<LayoutGrid size={24} color={Colors.primary} />}
            onPress={() => router.push('/(admin)/categories')}
          />
          <AdminMenuButton
            title="Ürün Yönetimi"
            description="Envanter, fiyat ve stok bilgilerini güncelleyin"
            icon={<Package size={24} color={Colors.primary} />}
            onPress={() => router.push('/(admin)/products')}
          />
        </View>

        <View
          style={{
            marginTop: 32,
            backgroundColor: Colors.primary,
            borderRadius: 24,
            padding: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>Hızlı Satış Raporu</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
              Son 24 saatlik performansı inceleyin
            </Text>
          </View>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowUpRight size={24} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function AdminMenuButton({ title, description, icon, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: Colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ fontWeight: '700', color: Colors.text }}>{title}</Text>
        <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>{description}</Text>
      </View>
      <ChevronRight size={20} color={Colors.textMuted} />
    </Pressable>
  );
}
