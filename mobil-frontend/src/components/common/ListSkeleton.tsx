import { View } from 'react-native';

import Colors from '@constants/colors';

interface ListSkeletonProps {
  rows?: number;
}

export function ListSkeleton({ rows = 4 }: ListSkeletonProps) {
  return (
    <View style={{ padding: 16, gap: 10, backgroundColor: Colors.background }}>
      {Array.from({ length: rows }, (_, index) => (
        <View
          key={index}
          style={{
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 14,
            padding: 12,
            backgroundColor: Colors.surface,
            gap: 8,
          }}
        >
          <View style={{ width: '45%', height: 12, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
          <View style={{ width: '70%', height: 10, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
          <View style={{ width: '35%', height: 10, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
        </View>
      ))}
    </View>
  );
}
