import Colors from '@/assets/colors'
import AdjustableRatingStars from '@/components/AdjustableRatingStars'
import styles from '@/components/edit/styles'
import InfoCard from '@/components/InfoCard'
import { useStrings } from '@/providers/I18nProvider'
import { useImageUrl } from '@/utils/images'
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

  // 1) Räkna ut målstorlek i layout-px (innan hooken anropas)
  const thumbSize = useMemo(() => {
    if (!rightColHeight) return 64
    return Math.max(minThumb, Math.min(rightColHeight, maxThumb))
  }, [rightColHeight, minThumb, maxThumb])

  // 2) Hämta lämplig thumbnail-URL baserat på aktuell storlek
  const { url } = useImageUrl(drink?.image_label ?? null, thumbSize)

  return (
    <InfoCard style={styles.headerCard}>
      <View style={styles.headerRow}>
        {/* Bild */}
        <Pressable onPress={onImagePress} disabled={!url}>
          {url ? (
            <Image
              source={{ uri: url }}
              style={[
                styles.thumbnail,
                { width: thumbSize, height: thumbSize, borderRadius: thumbSize / 6 },
              ]}
            />
          ) : (
            <View
              style={[
                styles.thumbnail,
                {
                  width: thumbSize,
                  height: thumbSize,
                  borderRadius: thumbSize / 6,
                  backgroundColor: Colors.superLightBlueGray,
                },
              ]}
            />
          )}
        </Pressable>

        {/* Textkolumn (vi mäter denna höjd för att anpassa thumbSize) */}
        <View
          style={styles.headerTextColumn}
          onLayout={e => setRightColHeight(e.nativeEvent.layout.height)}
        >
          <Text style={styles.name} numberOfLines={1}>
            {drink?.name}
          </Text>
          {!!drink?.brand && (
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
