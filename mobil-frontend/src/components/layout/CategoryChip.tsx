import { Pressable, Text } from 'react-native';

import Colors from '@constants/colors';

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function CategoryChip({ label, selected = false, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? Colors.primary : Colors.border,
        backgroundColor: selected ? '#FEF3C7' : Colors.surface,
      }}
    >
      <Text style={{ color: selected ? Colors.primaryDark : Colors.text, fontSize: 13, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}
