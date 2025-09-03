// DrinkCategories.tsx
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import sharedStyles from '@/components/shared/styles'
import { useStrings } from '@/providers/I18nProvider'
import { FontAwesome5 } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'

type Props = { onSelect?: (selected: string[]) => void }

export default function DrinkCategories({ onSelect }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const { t } = useStrings()

  const all_categories = [
    { type: 'wine', label: t.general.drink_types.wine, icon: 'wine-bottle' },
    { type: 'beer', label: t.general.drink_types.beer, icon: 'beer' },
    { type: 'juice_cider', label: t.general.drink_types.juice_cider, icon: 'apple-alt' },
    { type: 'soft_drink', label: t.general.drink_types.soft_drink, icon: 'glass-whiskey' },
    {
      type: 'sparkling_wine',
      label: t.general.drink_types.sparkling_wine,
      icon: 'wine-bottle',
    },
    { type: 'water', label: t.general.drink_types.water, icon: 'tint' },
    { type: 'tea', label: t.general.drink_types.tea, icon: 'leaf' },
    { type: 'spirits', label: t.general.drink_types.spirits, icon: 'glass-martini-alt' },
    { type: 'other', label: t.general.drink_types.other, icon: 'glass-cheers' },
  ]

  function toggleCategory(type: string) {
    const updated = selected.includes(type) ? selected.filter(t => t !== type) : [...selected, type]
    setSelected(updated)
    onSelect?.(updated)
  }

  return (
    <View style={sharedStyles.drinkCategoriesWrap}>
      <ScrollView
        horizontal
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets
        showsHorizontalScrollIndicator={false}
        style={sharedStyles.drinkCategoriesScrollView}
        contentContainerStyle={sharedStyles.drinkCategoriesRow}
      >
        {all_categories.map(category => {
          const isSelected = selected.includes(category.type)
          return (
            <TouchableOpacity
              key={category.type}
              style={sharedStyles.drinkCategoriesItem}
              onPress={() => toggleCategory(category.type)}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name={category.icon as any}
                size={Styles.iconSizeLarge}
                color={isSelected ? Colors.primary : Colors.gray}
              />
              <Text
                style={[
                  sharedStyles.drinkCategoriesLabel,
                  isSelected && sharedStyles.drinkCategoriesSelectedLabel,
                ]}
                numberOfLines={1}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}
