// components/add/DrinkList.tsx
import Styles from '@/assets/styles'
import styles from '@/components/add/styles'
import IconTextInput from '@/components/IconTextInput'
import InfoCard from '@/components/InfoCard'
import type { ListDrink } from '@/types/list'
import React from 'react'
import { Text, View } from 'react-native'
import DrinkListItem from './DrinkListItem'

type Props = {
  label: string
  drinks: ListDrink[]
  selectedId?: string | null
  onSelect: (d: ListDrink) => void
  search: string
  onSearch: (q: string) => void
  emptyText: string
}

export default function DrinkList({
  label,
  drinks,
  selectedId,
  onSelect,
  search,
  onSearch,
  emptyText,
}: Props) {
  return (
    <InfoCard label={label}>
      <IconTextInput
        icon="search"
        placeholder=""
        value={search}
        onChangeText={onSearch}
        autoCorrect={false}
        returnKeyType="search"
      />
      {drinks.length === 0 ? (
        <Text style={styles.noResults}>{emptyText}</Text>
      ) : (
        <View style={{ gap: Styles.gapMain, marginTop: Styles.marginPaddingMicro }}>
          {drinks.map(d => (
            <DrinkListItem
              key={d.id}
              item={d}
              selected={selectedId === d.id}
              onPress={() => onSelect(d)}
            />
          ))}
        </View>
      )}
    </InfoCard>
  )
}
