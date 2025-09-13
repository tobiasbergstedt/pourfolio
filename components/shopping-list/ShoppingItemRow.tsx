// components/shopping/ShoppingItemRow.tsx
import styles from '@/components/shopping-list/styles'
import type { DraftItem } from '@/hooks/useShoppingList'
import { useStrings } from '@/providers/I18nProvider'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

type Props = {
  item: DraftItem
  index: number
  onToggle: (index: number, checked: boolean) => void
  onInc: (index: number, delta: number) => void
  onDelete: (index: number) => void
}

export default function ShoppingItemRow({ item, index, onToggle, onInc, onDelete }: Props) {
  const { t } = useStrings()

  return (
    <View style={styles.shoppingItemContainer}>
      <Pressable onPress={() => onToggle(index, !item.checked)} hitSlop={8}>
        <Ionicons name={item.checked ? 'checkbox' : 'square-outline'} size={24} />
      </Pressable>

      <View style={styles.shoppingItemTextContainer}>
        <Text
          style={[
            styles.shoppingItemName,
            {
              textDecorationLine: item.checked ? 'line-through' : 'none',
              opacity: item.checked ? 0.6 : 1,
            },
          ]}
        >
          {item.name}
        </Text>
        <Text style={styles.shoppingItemAmount}>
          {t.shopping_list.amount}: {item.quantity}
        </Text>
      </View>

      <View style={styles.shoppingItemIconsContainer}>
        <Pressable
          onPress={() => onInc(index, -1)}
          disabled={item.quantity <= 0}
          style={[
            styles.shoppingItemAmountIcon,
            {
              opacity: item.quantity <= 0 ? 0.4 : 1,
            },
          ]}
          hitSlop={8}
        >
          <Ionicons name="remove" size={18} />
        </Pressable>

        <Pressable
          onPress={() => onInc(index, 1)}
          style={styles.shoppingItemAmountIcon}
          hitSlop={8}
        >
          <Ionicons name="add" size={18} />
        </Pressable>

        <Pressable
          onPress={() => onDelete(index)}
          style={styles.shoppingItemRemoveIcon}
          hitSlop={8}
        >
          <Ionicons name="trash" size={18} />
        </Pressable>
      </View>
    </View>
  )
}
