import { View } from 'react-native';

import Colors from '@constants/colors';

export function ProductSkeleton() {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        backgroundColor: Colors.surface,
      }}
    >
      <View style={{ height: 140, backgroundColor: '#E5E7EB' }} />
      <View style={{ padding: 10, gap: 8 }}>
        <View style={{ width: '45%', height: 10, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
        <View style={{ width: '90%', height: 12, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
        <View style={{ width: '70%', height: 12, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
      </View>
    </View>
  );
}
