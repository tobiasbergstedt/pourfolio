import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import styles from '@/components/navigation/styles'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, Text } from 'react-native'

type Props = {
  t: any
  version?: string
  build?: string | number
  onPress?: () => void
}

export default function FooterVersion({ t, version, build, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.appDrawerContentVersionContainer,
        { paddingTop: Styles.marginPaddingSmall },
        pressed && { opacity: 0.75 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={t.general.app_version}
    >
      <MaterialCommunityIcons name="information-outline" size={16} color={Colors.gray} />
      <Text style={styles.appDrawerContentVersion}>
        v{version}
        {build ? ` (${build})` : ''}
      </Text>
    </Pressable>
  )
}
