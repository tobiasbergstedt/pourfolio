// components/BackButton.tsx
import { useStrings } from '@/providers/I18nProvider'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import React from 'react'
import { Pressable } from 'react-native'

type Props = { color?: string; size?: number }

export default function BackButton({ color = 'black', size = 30 }: Props) {
  const navigation = useNavigation()
  const { t } = useStrings()

  const onPress = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack()
    } else {
      // Fallbacks om ingen back-stack finns
      // @ts-expect-error
      navigation.openDrawer?.() || navigation.replace?.('/') || navigation.navigate?.('index')
    }
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={{ paddingHorizontal: 16, paddingVertical: 16 }}
      accessibilityRole="button"
      accessibilityLabel={t.general.back}
    >
      <Ionicons name="chevron-back" size={size} color={color} />
    </Pressable>
  )
}
