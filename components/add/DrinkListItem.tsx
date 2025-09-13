// components/add/DrinkListItem.tsx
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import styles from '@/components/add/styles'
import { useStrings } from '@/providers/I18nProvider'
import type { ListDrink } from '@/types/list'
import { formatAlcoholText } from '@/utils/drinks'
import { useImageUrl } from '@/utils/images'
import { FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'

type Props = {
  item: ListDrink
  selected?: boolean
  onPress?: () => void
}

export default function DrinkListItem({ item, selected, onPress }: Props) {
  const { t } = useStrings()
  const alcText = formatAlcoholText(item.alcohol_percent, t)

  const { url } = useImageUrl(item.image_label ?? null, 'list')

  return (
    <Pressable
      onPress={onPress}
      style={[styles.drinkRow, selected && { borderColor: Colors.primary }]}
    >
      <View style={styles.row}>
        <Image source={{ uri: url || 'https://via.placeholder.com/50' }} style={styles.thumbnail} />
        <View style={styles.middleColumn}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.brand}</Text>
          <View style={styles.detailsTextWrapper}>
            <View style={styles.propertyRow}>
              <FontAwesome5 name="wine-bottle" size={Styles.iconSizeSmall} color={Colors.primary} />
              <Text style={styles.detailsText}>
                {item.volume} {t.general.ml}
              </Text>
            </View>
            <View style={styles.propertyRow}>
              <FontAwesome5 name="percent" size={Styles.iconSizeSmaller} color={Colors.primary} />
              <Text style={styles.detailsText}>{alcText}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  )
}
