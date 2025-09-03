// components/common/CategoryGrid.tsx
import Colors from '@/assets/colors'
import sharedStyles from '@/components/shared/styles'
import { useStrings } from '@/providers/I18nProvider'
import { DrinkType, GridItem, StyleOverrides } from '@/types/types'
import { makeI18nTranslators } from '@/utils/i18n'
import React, { useMemo } from 'react'
import { FlatList, Image, Pressable, Text, View } from 'react-native'

type Props = {
  data: DrinkType[]
  selectedId?: string | null
  onSelect: (t: DrinkType) => void
  styleOverrides?: StyleOverrides
  rowGap?: number
  columnGap?: number
  padOdd?: boolean // default: true
}

export default function CategoryGrid({
  data,
  selectedId,
  onSelect,
  styleOverrides,
  rowGap = 10,
  columnGap = 10,
  padOdd = true,
}: Props) {
  const { t } = useStrings()
  const { translateDrinkType } = useMemo(() => makeI18nTranslators(t), [t])

  const paddedData = useMemo<GridItem[]>(() => {
    if (!padOdd) return data
    return data.length % 2 === 1 ? [...data, { id: '__placeholder__', __placeholder: true }] : data
  }, [data, padOdd])

  return (
    <FlatList
      data={paddedData}
      keyExtractor={(item: GridItem) => ('__placeholder' in item ? item.id : item.id)}
      numColumns={2}
      scrollEnabled={false}
      contentContainerStyle={{ rowGap }}
      columnWrapperStyle={{ columnGap }}
      renderItem={({ item }) => {
        // Osynlig cell som tar plats så sista raden alltid har 2 kolumner
        if ('__placeholder' in item) {
          return (
            <View
              style={[sharedStyles.typeCell, styleOverrides?.cell, { opacity: 0 }]}
              pointerEvents="none"
            />
          )
        }

        const t = item as DrinkType
        const active = selectedId === t.id
        const label = translateDrinkType((t as any)?.name ?? t.id, { prettifyFallback: true })

        return (
          <Pressable
            onPress={() => onSelect(t)}
            style={[
              sharedStyles.typeCell,
              styleOverrides?.cell,
              active && [sharedStyles.typeCellActive, styleOverrides?.cellActive],
            ]}
          >
            {t.icon ? (
              <Image
                source={{ uri: t.icon }}
                style={[sharedStyles.typeIcon, styleOverrides?.icon]}
              />
            ) : (
              <View
                style={[
                  sharedStyles.typeIcon,
                  sharedStyles.typeIconFallback,
                  styleOverrides?.icon,
                  styleOverrides?.iconFallback,
                ]}
              />
            )}
            <Text
              style={[
                sharedStyles.typeText,
                styleOverrides?.text,
                active && { color: Colors.primary },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        )
      }}
    />
  )
}
