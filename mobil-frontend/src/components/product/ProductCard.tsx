import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { Product } from '@/types';
import Colors from '@constants/colors';
import { formatCurrency } from '@utils/formatCurrency';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const productId = product.id ?? product._id;

  return (
    <Pressable
      onPress={() => {
        if (productId) {
          router.push(`/product/${productId}`);
        }
      }}
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <Image
        source={product.imageUrl || product.images[0] || 'https://placehold.co/600x400/png'}
        contentFit="cover"
        transition={250}
        style={{ width: '100%', height: 140, backgroundColor: '#F3F4F6' }}
      />
      <View style={{ padding: 10 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 12, marginBottom: 4 }} numberOfLines={1}>
          {product.category ?? 'DekoHome'}
        </Text>
        <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '700', minHeight: 36 }} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: '700', marginTop: 4 }}>
          {formatCurrency(product.price)}
        </Text>
        {product.stock === 0 ? (
          <Text style={{ marginTop: 4, color: Colors.error, fontSize: 12 }}>Stok tükendi</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
