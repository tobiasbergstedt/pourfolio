// components/shopping-list/DrinkPicker.tsx
import Colors from '@/assets/colors'
import IconTextInput from '@/components/IconTextInput'
import styles from '@/components/shopping-list/styles'
import { useDrinkTypes, type DrinkType } from '@/hooks/useDrinkTypes'
import { useStrings } from '@/providers/I18nProvider'
import { useImageUrl } from '@/utils/images'
import { FontAwesome5 } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

function DrinkThumb({ label, size = 54 }: { label?: string | null; size?: number }) {
  // Använd vår generella bild-resolver (preset "thumb" ≈ 36px)
  const { url, meta } = useImageUrl(label ?? null, 'thumb')

  if (!url) {
    return (
      <View
        style={[
          styles.drinkThumb,
          {
            width: size,
            height: size,
          },
        ]}
      />
    )
  }

  return (
    <Image
      source={{ uri: url }}
      style={[styles.drinkThumb, { width: size, height: size }]}
      contentFit="cover"
      cachePolicy="disk"
      transition={100}
    />
  )
}

type Props = {
  selectedId?: string | null
  onSelect: (drink: DrinkType) => void
  onAdd: (drink: DrinkType) => void
}

export default function DrinkPicker({ selectedId = null, onSelect, onAdd }: Props) {
  const { types } = useDrinkTypes()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return types
    return types.filter(d => d.name?.toLowerCase().includes(s))
  }, [q, types])
  const { t } = useStrings()

  return (
    <View style={styles.drinkPickerContainer}>
      <IconTextInput
        icon="search"
        value={q}
        onChangeText={setQ}
        placeholder={t.home.search_placeholder}
        returnKeyType="search"
        autoCorrect={false}
      />

      {filtered.length === 0 ? (
        <Text style={styles.noMatchesText}>{t.shopping_list.no_matches}</Text>
      ) : (
        <View style={styles.drinkPickerList}>
          {filtered.map(item => {
            const isSelected = item.id === selectedId
            return (
              <Pressable
                key={item.id}
                onPress={() => onSelect(item)}
                style={[
                  styles.drinkPickerListItem,
                  {
                    borderColor: isSelected ? Colors.primary : Colors.border,
                  },
                ]}
              >
                <DrinkThumb label={item.image_label} size={54} />

                <View style={styles.drinkPickerItemName}>
                  <Text style={styles.drinkPickerItemNameText}>{item.name}</Text>
                </View>

                {isSelected ? (
                  <Pressable
                    onPress={() => onAdd(item)}
                    style={({ pressed }) => [
                      styles.drinkPickerAddIcon,
                      pressed && styles.drinkPickerAddIconPressed,
                    ]}
                    hitSlop={6}
                  >
                    <FontAwesome5 name="plus" size={18} color={Colors.white} />
                  </Pressable>
                ) : null}
              </Pressable>
            )
          })}
        </View>
      )}
    </View>
  )
}
