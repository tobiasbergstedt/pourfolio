import AdjustableRatingStars from '@/components/AdjustableRatingStars'
import styles from '@/components/edit/styles'
import InfoCard from '@/components/InfoCard'
import { useStrings } from '@/providers/I18nProvider'
import { useMemo, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'

type Props = {
  drink: any
  onImagePress: () => void
  userRating: number | null
  avgRating: number | null
  ratingCount: number | null
  updateUserRating: (rating: number) => void
  minThumb?: number
  maxThumb?: number
}

export default function HeaderCard({
  drink,
  onImagePress,
  userRating,
  avgRating,
  ratingCount,
  updateUserRating,
  minThumb = 48,
  maxThumb = 128,
}: Props) {
  const [rightColHeight, setRightColHeight] = useState<number | null>(null)
  const { t } = useStrings()

  const thumbSize = useMemo(() => {
    if (!rightColHeight) return 64
    return Math.max(minThumb, Math.min(rightColHeight, maxThumb))
  }, [rightColHeight, minThumb, maxThumb])

  return (
    <InfoCard style={styles.headerCard}>
      <View style={styles.headerRow} onLayout={e => setRightColHeight(e.nativeEvent.layout.height)}>
        {drink?.image_label && (
          <Pressable onPress={onImagePress}>
            <Image
              source={{ uri: drink.image_label }}
              style={[
                styles.thumbnail,
                { width: thumbSize, height: thumbSize, borderRadius: thumbSize / 6 },
              ]}
            />
          </Pressable>
        )}

        <View style={styles.headerTextColumn}>
          <Text style={styles.name} numberOfLines={1}>
            {drink?.name}
          </Text>
          {drink?.brand && (
            <Text style={styles.brand} numberOfLines={1}>
              {drink.brand}
            </Text>
          )}
          <View style={styles.starsRow}>
            <Text>{t.edit_drink.user_rating}:</Text>
            <AdjustableRatingStars rating={userRating ?? 0} onRate={updateUserRating} />
            {avgRating !== null && (
              <Text style={styles.ratingSummary}>
                {t.edit_drink.average}: {avgRating.toFixed(1)} ({ratingCount} {t.edit_drink.votes})
              </Text>
            )}
          </View>
        </View>
      </View>
    </InfoCard>
  )
}
