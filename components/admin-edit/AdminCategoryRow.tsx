// components/admin-categories/AdminCategoryRow.tsx
import styles from '@/components/admin-edit/styles'
import type { AdminCategory } from '@/hooks/useAdminCategoryList'
import { useStrings } from '@/providers/I18nProvider'
import { makeI18nTranslators } from '@/utils/i18n'
import React, { useMemo } from 'react'
import { Image, Pressable, Text, View } from 'react-native'

type Props = {
  category: AdminCategory
  onPress: () => void
  /** Sätt true om du vill visa sluggen under namnet för felsökning */
}

export default function AdminCategoryRow({ category, onPress }: Props) {
  const { t } = useStrings()
  const { translateDrinkType } = useMemo(() => makeI18nTranslators(t), [t])
  // Använd utilen – prova först doc.name, annars slug (id)
  const label = translateDrinkType(category.displayName ?? category.id, {
    prettifyFallback: true,
  })

  return (
    <Pressable onPress={onPress} style={styles.adminCategoryRowPressable}>
      <View style={styles.adminCategoryRowContainer}>
        {category.icon ? (
          <Image source={{ uri: category.icon }} style={styles.adminCategoryRowIcon} />
        ) : (
          <View style={styles.adminCategoryRowIcon} />
        )}

        <View style={styles.adminCategoryRowTextWrap}>
          <Text style={styles.adminCategoryRowTitle}>{label}</Text>
          <Text style={styles.adminCategoryRowId}>{category.id}</Text>
        </View>

        <Text style={styles.adminCategoryRowChevron}>{'›'}</Text>
      </View>
    </Pressable>
  )
}
