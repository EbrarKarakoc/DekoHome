import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import Colors from '@constants/colors';

interface RatingStarsProps {
  rating: number;
  size?: number;
  editable?: boolean;
  onChange?: (rating: number) => void;
}

export function RatingStars({ rating, size = 16, editable = false, onChange }: RatingStarsProps) {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }, (_, index) => {
        const current = index + 1;
        const iconName = current <= roundedRating ? 'star' : 'star-outline';

        if (editable) {
          return (
            <Pressable key={current} onPress={() => onChange?.(current)}>
              <Ionicons name={iconName} size={size} color={Colors.primary} />
            </Pressable>
          );
        }

        return <Ionicons key={current} name={iconName} size={size} color={Colors.primary} />;
      })}
    </View>
  );
}
