import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';

import { EmptyState } from '@components/common/EmptyState';
import { ErrorMessage } from '@components/common/ErrorMessage';
import { RatingStars } from '@components/product/RatingStars';
import { ReviewItem } from '@components/product/ReviewItem';
import type { ReviewPayload } from '@/types';
import Colors from '@constants/colors';
import { useAddToCart } from '@hooks/useCart';
import { useProduct } from '@hooks/useProducts';
import { useCanReview, useCreateReview, useReviews } from '@hooks/useReviews';
import { useAuthStore } from '@store/authStore';
import { getErrorMessage } from '@utils/error';
import { formatCurrency } from '@utils/formatCurrency';
import { hapticError, hapticSuccess, hapticTap } from '@utils/haptics';

const reviewSchema = z.object({
  rating: z.number().min(1, 'En az 1 yildiz secmelisiniz').max(5, 'En fazla 5 yildiz secilebilir'),
  comment: z.string().trim().min(5, 'Yorum en az 5 karakter olmali').max(500, 'Yorum en fazla 500 karakter olmali'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const productId = typeof params.id === 'string' ? params.id : '';
  const { width } = useWindowDimensions();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const productQuery = useProduct(productId);
  const reviewsQuery = useReviews(productId);
  const canReviewQuery = useCanReview(productId, isAuthenticated);
  const createReviewMutation = useCreateReview(productId);
  const addToCartMutation = useAddToCart();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  const product = productQuery.data;
  const reviews = reviewsQuery.data ?? [];
  const images = product?.images?.length
    ? product.images
    : product?.imageUrl
      ? [product.imageUrl]
      : ['https://placehold.co/1200x800/png'];

  const averageRatingFromReviews =
    reviews.length > 0 ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;
  const averageRating = product?.ratings ?? averageRatingFromReviews;

  const onSubmitReview = async (values: ReviewFormValues) => {
    const payload: ReviewPayload = {
      rating: values.rating,
      comment: values.comment,
    };

    try {
      await hapticTap();
      await createReviewMutation.mutateAsync(payload);
      await hapticSuccess();
      reset({ rating: 5, comment: '' });
      showMessage({ message: 'Yorumunuz kaydedildi', type: 'success' });
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showMessage({ message: 'Sepete eklemek icin giris yapmalisiniz', type: 'warning' });
      router.push('/(auth)/login');
      return;
    }

    if (!productId) {
      showMessage({ message: 'Urun bilgisi eksik', type: 'danger' });
      return;
    }

    try {
      await hapticTap();
      await addToCartMutation.mutateAsync({ productId, quantity: 1 });
      await hapticSuccess();
      showMessage({ message: 'Urun sepete eklendi', type: 'success' });
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
    }
  };

  if (productQuery.isLoading || reviewsQuery.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.background }}>
        <ErrorMessage
          message={getErrorMessage(productQuery.error ?? new Error('Urun bulunamadi'))}
          onRetry={async () => {
            await Promise.all([productQuery.refetch(), reviewsQuery.refetch(), canReviewQuery.refetch()]);
          }}
        />
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, fontWeight: '600', marginTop: 10 }}>Geri don</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingBottom: 28 }}
      refreshControl={
        <RefreshControl
          refreshing={productQuery.isRefetching || reviewsQuery.isRefetching || canReviewQuery.isRefetching}
          onRefresh={async () => {
            await Promise.all([productQuery.refetch(), reviewsQuery.refetch(), canReviewQuery.refetch()]);
          }}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, fontWeight: '600' }}>Geri don</Text>
        </Pressable>
      </View>

      <FlatList
        data={images}
        horizontal
        pagingEnabled
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <Image
            source={item}
            contentFit="cover"
            style={{ width, height: width * 0.72, backgroundColor: '#E5E7EB' }}
          />
        )}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;
          const nextIndex = Math.round(offsetX / width);
          setActiveImageIndex(nextIndex);
        }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 }}>
        {images.map((_, index) => (
          <View
            key={index}
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              backgroundColor: index === activeImageIndex ? Colors.primary : '#D1D5DB',
            }}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>{product.category ?? 'DekoHome'}</Text>
        <Text style={{ color: Colors.text, fontSize: 28, fontWeight: '700', marginTop: 4 }}>{product.name}</Text>

        <Text style={{ color: Colors.primary, fontSize: 25, fontWeight: '700', marginTop: 8 }}>
          {formatCurrency(product.price)}
        </Text>

        <Pressable
          disabled={addToCartMutation.isPending}
          onPress={handleAddToCart}
          style={{
            marginTop: 12,
            height: 46,
            borderRadius: 12,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: addToCartMutation.isPending ? 0.7 : 1,
          }}
        >
          {addToCartMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Sepete Ekle</Text>
          )}
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <RatingStars rating={averageRating} size={16} />
          <Text style={{ color: Colors.textSecondary }}>
            {averageRating.toFixed(1)} ({reviews.length} yorum)
          </Text>
        </View>

        <Text style={{ color: Colors.textSecondary, marginTop: 12, lineHeight: 21 }}>
          {product.description || product.desc}
        </Text>

        <Text style={{ marginTop: 22, marginBottom: 10, color: Colors.text, fontWeight: '700', fontSize: 18 }}>
          Yorumlar
        </Text>

        {reviews.length === 0 ? (
          <View style={{ marginBottom: 16 }}>
            <EmptyState icon="chatbubble-ellipses-outline" title="Henuz yorum yok" description="Ilk yorumu siz yazabilirsiniz." />
          </View>
        ) : (
          <View style={{ gap: 10, marginBottom: 16 }}>
            {reviews.map((review) => (
              <ReviewItem key={review.id ?? review._id ?? `${review.userName}-${review.createdAt}`} review={review} />
            ))}
          </View>
        )}

        {reviewsQuery.isError ? (
          <View style={{ marginBottom: 16 }}>
            <ErrorMessage
              message={getErrorMessage(reviewsQuery.error)}
              onRetry={async () => {
                await reviewsQuery.refetch();
              }}
            />
          </View>
        ) : null}

        <Text style={{ marginTop: 6, marginBottom: 10, color: Colors.text, fontWeight: '700', fontSize: 18 }}>
          Yorum Ekle
        </Text>

        {!isAuthenticated ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              padding: 14,
              backgroundColor: Colors.surface,
              gap: 10,
            }}
          >
            <Text style={{ color: Colors.textSecondary }}>Yorum yazabilmek icin giris yapmalisiniz.</Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>Giris ekranina git</Text>
            </Pressable>
          </View>
        ) : canReviewQuery.isLoading ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              padding: 14,
              backgroundColor: Colors.surface,
              alignItems: 'center',
            }}
          >
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : canReviewQuery.data ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              padding: 14,
              backgroundColor: Colors.surface,
            }}
          >
            <Controller
              control={control}
              name="rating"
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: Colors.text, fontWeight: '600', marginBottom: 6 }}>Puaniniz</Text>
                  <RatingStars rating={value} editable onChange={onChange} size={24} />
                  {errors.rating ? (
                    <Text style={{ marginTop: 6, color: Colors.error, fontSize: 12 }}>{errors.rating.message}</Text>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="comment"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text style={{ color: Colors.text, fontWeight: '600', marginBottom: 6 }}>Yorum</Text>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Deneyiminizi yazin"
                    placeholderTextColor={Colors.textMuted}
                    style={{
                      borderWidth: 1,
                      borderColor: errors.comment ? Colors.error : Colors.border,
                      borderRadius: 12,
                      minHeight: 100,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: Colors.text,
                      textAlignVertical: 'top',
                    }}
                    value={value}
                  />
                  {errors.comment ? (
                    <Text style={{ marginTop: 6, color: Colors.error, fontSize: 12 }}>{errors.comment.message}</Text>
                  ) : null}
                </View>
              )}
            />

            <Pressable
              disabled={isSubmitting || createReviewMutation.isPending}
              onPress={handleSubmit(onSubmitReview)}
              style={{
                marginTop: 14,
                backgroundColor: Colors.primary,
                borderRadius: 12,
                height: 46,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isSubmitting || createReviewMutation.isPending ? 0.7 : 1,
              }}
            >
              {isSubmitting || createReviewMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Yorumu Gonder</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              padding: 14,
              backgroundColor: Colors.surface,
            }}
          >
            <Text style={{ color: Colors.textSecondary }}>
              Sadece satin aldiginiz urunlere yorum yapabilirsiniz.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
