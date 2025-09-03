// components/ui/AutoShrinkText.tsx
import React from 'react'
import { Text, TextProps } from 'react-native'

type Props = TextProps & {
  minimumFontScale?: number
}

export default function AutoShrinkText({
  children,
  minimumFontScale = 0.7,
  numberOfLines = 1,
  ...rest
}: Props) {
  return (
    <Text
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit
      minimumFontScale={minimumFontScale}
      {...rest}
    >
      {children}
    </Text>
  )
}
