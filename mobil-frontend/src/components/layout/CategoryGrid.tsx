import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Sofa, Bed, Utensils, Briefcase, Package, Sparkles, ChevronRight, LayoutGrid } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCategories } from '@hooks/useCategories';

const getIconForCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('oturma')) return Sofa;
  if (n.includes('yatak')) return Bed;
  if (n.includes('mutfak')) return Utensils;
  if (n.includes('ofis')) return Briefcase;
  if (n.includes('depolama') || n.includes('dolap')) return Package;
  if (n.includes('dekorasyon') || n.includes('aydinlatma')) return Sparkles;
  return LayoutGrid;
};

export default function CategoryGrid() {
  const router = useRouter();
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading && categories.length === 0) {
    return (
      <View className="mb-12 py-10 px-4 items-center">
        <ActivityIndicator color="#D48806" />
      </View>
    );
  }

  // Sadece ana kategorileri göster (hiyerarşinin en üstü)
  const mainCategories = categories.slice(0, 8);

  return (
    <View className="mb-12 bg-[#FAFAF9] pt-10 pb-16 px-4 md:px-10">
      <View className="flex-row items-end justify-between mb-8 max-w-7xl mx-auto w-full px-2">
        <View>
          <Text className="font-playfair text-3xl text-slate-900 mb-1 font-bold">Kategoriler</Text>
          <Text className="text-slate-500 text-sm font-inter">İhtiyacınıza uygun alanı seçin</Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/categories')} className="flex-row items-center gap-1">
          <Text className="text-[#D48806] text-sm font-inter-bold">Tümünü Gör</Text>
          <ChevronRight size={16} color="#D48806" />
        </Pressable>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 8, gap: 16 }}
        className="max-w-7xl mx-auto w-full"
      >
        {mainCategories.map((cat) => {
          const Icon = getIconForCategory(cat.name);
          const catId = cat.id || cat._id;
          return (
            <Pressable
              key={catId}
              onPress={() => router.push({
                  pathname: '/(tabs)/categories',
                  params: { categoryId: catId }
              })}
              className="w-[140px] md:w-[180px] aspect-square bg-[#F8FAFC] hover:bg-white rounded-[24px] items-center justify-center border border-transparent hover:border-yellow-100 transition-all shadow-sm"
            >
              <View className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white items-center justify-center mb-4 transition-transform shadow-sm">
                <Icon size={28} color="#334155" strokeWidth={1.5} />
              </View>
              <Text className="text-[12px] font-inter-bold text-slate-900 text-center px-2">
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
