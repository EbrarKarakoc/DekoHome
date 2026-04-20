import { Text, View } from 'react-native';

import type { Review } from '@/types';
import Colors from '@constants/colors';
import { formatDate } from '@utils/formatDate';

import { RatingStars } from './RatingStars';

interface ReviewItemProps {
  review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        padding: 12,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: Colors.text, fontWeight: '700' }}>{review.userName}</Text>
        <Text style={{ color: Colors.textMuted, fontSize: 12 }}>{formatDate(review.createdAt)}</Text>
      </View>
      <RatingStars rating={review.rating} size={14} />
      <Text style={{ color: Colors.textSecondary, lineHeight: 20 }}>{review.comment}</Text>
    </View>
  );
}
