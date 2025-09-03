// home/DrinkItem.tsx
import Styles from '@/assets/styles'
import RatingStars from '@/components/RatingStars'
import { useStrings } from '@/providers/I18nProvider'
import { Drink } from '@/types/types'
import { Image, Pressable, Text, View } from 'react-native'
import styles from './styles'

export default function DrinkItem({ item, onPress }: { item: Drink; onPress: () => void }) {
  const { t } = useStrings()

  return (
    <Pressable style={[styles.item, { marginBottom: Styles.marginPaddingMicro }]} onPress={onPress}>
      <View style={styles.row}>
        <Image
          source={{ uri: item.image_label || 'https://via.placeholder.com/50' }}
          style={styles.thumbnail}
        />
        <View style={styles.middleColumn}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.detailsTextWrapper}>
            <RatingStars rating={item.rating ?? 0} size={Styles.iconSizeSmaller} />
            <Text style={styles.detailsText}>
              {item.alcohol_percent != null && item.alcohol_percent < 0.5
                ? t.general.non_alcoholic
                : `${item.alcohol_percent}%`}
            </Text>
          </View>
        </View>
        <Text style={styles.quantity}>
          {item.quantity} {item.quantity && item.quantity > 1 ? t.general.pcs : t.general.pc}
        </Text>
      </View>
    </Pressable>
  )
}
