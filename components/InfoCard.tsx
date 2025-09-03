import sharedStyles from '@/components/shared/styles'
import React from 'react'
import { StyleProp, Text, View, ViewStyle } from 'react-native'

type Props = {
  label?: string
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export default function InfoCard({ label, children, style }: Props) {
  return (
    <View style={[sharedStyles.infoCard, style]}>
      {label ? <Text style={sharedStyles.infoCardLabel}>{label}</Text> : null}
      {children}
    </View>
  )
}
