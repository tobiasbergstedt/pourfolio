import styles from '@/components/admin-edit/styles'
import { AdminListDrink } from '@/hooks/useAdminEditList'
import { useImageUrl } from '@/utils/images'
import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'

type Props = {
  drink: AdminListDrink
  onPress: () => void
}

export default function AdminDrinkRow({ drink, onPress }: Props) {
  const { url } = useImageUrl(drink.image_label ?? null, 'list')

  return (
    <Pressable onPress={onPress} style={styles.adminDrinkRowContainer}>
      <Image
        source={{ uri: url || 'https://via.placeholder.com/72' }}
        style={styles.adminDrinkRowThumb}
      />
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.adminDrinkRowName} numberOfLines={1}>
          {drink.name}
        </Text>
        <Text style={styles.adminDrinkRowSub} numberOfLines={1}>
          {drink.brand ? `${drink.brand} • ${drink.typeLabel}` : drink.typeLabel}
        </Text>
      </View>
      <Text style={styles.adminDrinkRowChevron}>{'›'}</Text>
    </Pressable>
  )
}
