import { useRouter } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

import type { Product } from '@/types';
import { formatCurrency } from '@utils/formatCurrency';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

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
      </View>

      <View className="mt-4 flex-1 flex-col justify-between">
        <View>
          <Text
            numberOfLines={1}
            className="text-lg font-bold text-slate-900 font-inter"
          >
            {product.name}
          </Text>
          <Text numberOfLines={1} className="mt-1 text-sm text-slate-500 font-inter">
            {product.category || product.desc}
          </Text>
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

