import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { CartItem as CartItemData } from '@/types';
import Colors from '@constants/colors';
import { formatCurrency } from '@utils/formatCurrency';

interface CartItemProps {
  item: CartItemData;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function CartItem({ item, onIncrease, onDecrease, onRemove, disabled = false }: CartItemProps) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 14,
        padding: 12,
        backgroundColor: Colors.surface,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Image
          source={item.imageUrl || 'https://placehold.co/320x240/png'}
          style={{ width: 78, height: 78, borderRadius: 10, backgroundColor: '#E5E7EB' }}
          contentFit="cover"
        />

        <View style={{ flex: 1 }}>
          <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 15 }} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={{ marginTop: 4, color: Colors.textSecondary }}>{formatCurrency(item.price)}</Text>
          <Text style={{ marginTop: 4, color: Colors.primary, fontWeight: '700' }}>
            Ara Toplam: {formatCurrency(item.subtotal)}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            disabled={disabled || item.quantity <= 1}
            onPress={onDecrease}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled || item.quantity <= 1 ? 0.4 : 1,
            }}
          >
            <Text style={{ fontSize: 18, color: Colors.textSecondary }}>-</Text>
          </Pressable>

          <Text style={{ color: Colors.text, fontWeight: '700', minWidth: 24, textAlign: 'center' }}>
            {item.quantity}
          </Text>

          <Pressable
            disabled={disabled}
            onPress={onIncrease}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.4 : 1,
            }}
          >
            <Text style={{ fontSize: 18, color: Colors.textSecondary }}>+</Text>
          </Pressable>
        </View>

        <Pressable disabled={disabled} onPress={onRemove}>
          <Text style={{ color: Colors.error, fontWeight: '700', opacity: disabled ? 0.4 : 1 }}>Kaldir</Text>
        </Pressable>
      </View>
    </View>
  );
}
