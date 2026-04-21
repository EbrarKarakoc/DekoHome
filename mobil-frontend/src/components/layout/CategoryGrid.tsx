import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Sofa, Bed, Utensils, Briefcase, Package, Sparkles, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const CATEGORIES = [
  { id: '1', name: 'Oturma Odası', icon: Sofa },
  { id: '2', name: 'Yatak Odası', icon: Bed },
  { id: '3', name: 'Mutfak', icon: Utensils },
  { id: '4', name: 'Ofis', icon: Briefcase },
  { id: '5', name: 'Depolama', icon: Package },
  { id: '6', name: 'Dekorasyon', icon: Sparkles },
];

export default function CategoryGrid() {
  const router = useRouter();

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
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => router.push({
                pathname: '/(tabs)/categories',
                params: { categoryId: cat.id }
            })}
            className="w-[140px] md:w-[180px] aspect-square bg-[#F8FAFC] hover:bg-white rounded-[24px] items-center justify-center border border-transparent hover:border-yellow-100 transition-all shadow-sm"
          >
            <View className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white items-center justify-center mb-4 transition-transform shadow-sm">
              <cat.icon size={28} color="#334155" strokeWidth={1.5} />
            </View>
            <Text className="text-[12px] font-inter-bold text-slate-900 text-center px-2">
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
