import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import Colors from '@constants/colors';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'cube-outline', title, description }: EmptyStateProps) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 14,
        padding: 16,
        backgroundColor: Colors.surface,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 999,
          backgroundColor: '#FEF3C7',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <Ionicons name={icon} size={24} color={Colors.primaryDark} />
      </View>

      <Text style={{ color: Colors.text, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
      {description ? (
        <Text style={{ marginTop: 4, color: Colors.textSecondary, textAlign: 'center' }}>{description}</Text>
      ) : null}
    </View>
  );
}
