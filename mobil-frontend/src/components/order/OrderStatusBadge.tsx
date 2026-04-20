import { Text, View } from 'react-native';

import type { OrderStatus } from '@/types';

function getStatusColors(status: OrderStatus) {
  switch (status) {
    case 'Onaylandı':
      return { backgroundColor: '#FEF3C7', color: '#B45309' };
    case 'Hazırlanıyor':
      return { backgroundColor: '#DBEAFE', color: '#1D4ED8' };
    case 'Kargoya Verildi':
      return { backgroundColor: '#EDE9FE', color: '#6D28D9' };
    case 'Teslim Edildi':
      return { backgroundColor: '#DCFCE7', color: '#15803D' };
    case 'İptal Edildi':
      return { backgroundColor: '#FEE2E2', color: '#B91C1C' };
    default:
      return { backgroundColor: '#F3F4F6', color: '#374151' };
  }
}

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const colors = getStatusColors(status);

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: colors.backgroundColor,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.color }}>{status}</Text>
    </View>
  );
}
