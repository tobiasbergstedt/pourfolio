// components/admin-categories/AdminCategoryRow.tsx
import Colors from '@/assets/colors'
import type { AdminCategory } from '@/hooks/useAdminCategoryList'
import { useStrings } from '@/providers/I18nProvider'
import { makeI18nTranslators } from '@/utils/i18n'
import React, { useMemo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

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
    <Pressable
      onPress={onPress}
      style={{
        height: 72,
        borderWidth: 2,
        borderColor: Colors.border,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: Colors.white,
      }}
    >
      <View style={s.container}>
        {category.icon ? (
          <Image source={{ uri: category.icon }} style={s.icon} />
        ) : (
          <View style={[s.icon, { backgroundColor: Colors.superLightGray }]} />
        )}

        <View style={s.textWrap}>
          <Text style={s.title}>{label}</Text>
          <Text style={{ fontSize: 13, color: Colors.gray }}>{category.id}</Text>
        </View>

        <Text style={s.chev}>{'›'}</Text>
      </View>
    </Pressable>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  icon: { width: 48, height: 48, borderRadius: 8 },
  textWrap: { flex: 1, paddingHorizontal: 12 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.black },
  slug: { fontSize: 13, color: Colors.gray, marginTop: 2 },
  chev: { paddingHorizontal: 12, color: Colors.gray, fontSize: 20, fontWeight: '500' },
})
