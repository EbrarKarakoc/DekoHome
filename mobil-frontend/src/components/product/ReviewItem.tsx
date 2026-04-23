import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { Review } from '@/types';
import Colors from '@constants/colors';
import { formatDate } from '@utils/formatDate';

import { RatingStars } from './RatingStars';

interface ReviewItemProps {
  review: Review;
  /** Oturum açmış kullanıcının ID'si – kendi yorumunu silme butonu görmesi için */
  currentUserId?: string;
  /** Yorum silme fonksiyonu */
  onDelete?: (reviewId: string) => void;
  /** Yorum düzenleme fonksiyonu (Düzenle moduna geçirir) */
  onEdit?: (review: Review) => void;
  /** Silme işlemi devam ediyor mu */
  isDeleting?: boolean;
}

export function ReviewItem({ review, currentUserId, onDelete, onEdit, isDeleting }: ReviewItemProps) {
  const reviewId = review.id ?? review._id ?? '';
  const isOwner = currentUserId && review.userId === currentUserId;

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

      {isOwner && (onDelete || onEdit) ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          {onEdit ? (
            <Pressable
              disabled={isDeleting}
              onPress={() => onEdit(review)}
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: '#FEF3C7',
                borderWidth: 1,
                borderColor: Colors.primary,
                opacity: isDeleting ? 0.5 : 1,
              }}
            >
              <Text style={{ color: Colors.primaryDark, fontWeight: '700', fontSize: 12 }}>Duzenle</Text>
            </Pressable>
          ) : null}

          {onDelete ? (
            <Pressable
              disabled={isDeleting}
              onPress={() => onDelete(reviewId)}
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: '#FEE2E2',
                borderWidth: 1,
                borderColor: Colors.error,
                opacity: isDeleting ? 0.5 : 1,
              }}
            >
              {isDeleting ? (
                <ActivityIndicator color={Colors.error} size="small" />
              ) : (
                <Text style={{ color: Colors.error, fontWeight: '700', fontSize: 12 }}>Yorumu Sil</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
