import { useRouter } from 'expo-router';
import { ShoppingBag, Sofa, Bed, Utensils, Briefcase, Package, Sparkles, LayoutGrid } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

import type { Product } from '@/types';
import { formatCurrency } from '@utils/formatCurrency';

const getIconForCategory = (name: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('oturma') || n.includes('misafir') || n.includes('koltuk') || n.includes('sehpa')) return Sofa;
  if (n.includes('yatak') || n.includes('gardırop')) return Bed;
  if (n.includes('mutfak')) return Utensils;
  if (n.includes('ofis')) return Briefcase;
  if (n.includes('depolama') || n.includes('dolap')) return Package;
  if (n.includes('dekorasyon') || n.includes('aydınlatma') || n.includes('aksesuar')) return Sparkles;
  return LayoutGrid;
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const categoryName = product.category || product.desc || '';
  const CategoryIcon = getIconForCategory(categoryName);

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      className="flex-1 flex-col mb-8 group"
    >
      <View className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-slate-50">
        <Image
          source={{ uri: product.imageUrl || 'https://placehold.co/400x500/png' }}
          className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
        />
        {/* Category icon badge */}
        <View style={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: 'rgba(255,255,255,0.92)',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}>
          <CategoryIcon size={16} color="#334155" strokeWidth={1.8} />
        </View>
      </View>

      <View className="mt-4 flex-1 flex-col justify-between">
        <View>
          <Text
            numberOfLines={1}
            className="text-lg font-bold text-slate-900 font-inter"
          >
            {product.name}
          </Text>
          {categoryName ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
              <CategoryIcon size={12} color="#94A3B8" strokeWidth={1.5} />
              <Text numberOfLines={1} className="text-sm text-slate-500 font-inter">
                {categoryName}
              </Text>
            </View>
          ) : null}
          <Text className="mt-2 text-xl font-black text-slate-900 font-inter">
            {formatCurrency(product.price)}
          </Text>
        </View>
        
        <Pressable 
          className="mt-4 flex-row w-full items-center justify-center gap-2 rounded-lg bg-[#D48806] py-3 active:bg-yellow-700 transition-colors"
          onPress={() => {
             // Will implement add to cart later
             alert('Ürün sepete eklendi');
          }}
        >
          <ShoppingBag size={18} color="white" strokeWidth={2.5} />
          <Text className="text-sm font-bold text-white font-inter">Sepete Ekle</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

