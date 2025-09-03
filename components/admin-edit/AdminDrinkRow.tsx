import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { AdminListDrink } from '@/hooks/useAdminEditList'
import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

type Props = {
  drink: AdminListDrink
  onPress: () => void
}

export default function AdminDrinkRow({ drink, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={s.row}>
      <Image
        source={{ uri: drink.image_label || 'https://via.placeholder.com/72' }}
        style={s.thumb}
      />
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={s.name} numberOfLines={1}>
          {drink.name}
        </Text>
        <Text style={s.sub} numberOfLines={1}>
          {drink.brand ? `${drink.brand} • ${drink.typeLabel}` : drink.typeLabel}
        </Text>
      </View>
      <Text style={s.chev}>{'›'}</Text>
    </Pressable>
  )
}

const s = StyleSheet.create({
  row: {
    minHeight: 72,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Styles.borderRadiusCard,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumb: { width: 72, height: 72, resizeMode: 'cover' },
  name: { fontSize: 16, fontWeight: '700', color: Colors.black },
  sub: { fontSize: 13, color: Colors.gray, marginTop: 2 },
  chev: { paddingHorizontal: 12, color: Colors.gray, fontSize: 20, fontWeight: '500' },
})
