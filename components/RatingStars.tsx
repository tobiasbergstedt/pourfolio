// components/RatingStars.tsx
import Colors from '@/assets/colors'
import sharedStyles from '@/components/shared/styles'
import { FontAwesome } from '@expo/vector-icons'
import React from 'react'
import { View } from 'react-native'

type Props = {
  rating: number // 0–5, stödjer decimalt
  size?: number
}

export default function RatingStars({ rating, size = 14 }: Props) {
  return (
    <View style={sharedStyles.ratingStarsRow}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fillLevel = Math.min(1, Math.max(0, rating - i)) // 0.0–1.0
        const color =
          fillLevel === 1
            ? Colors.primary
            : fillLevel > 0
              ? Colors.primary + '99' // halvfylld: 60% opacity
              : Colors.primary

        return (
          <FontAwesome
            key={i}
            name={fillLevel >= 0.5 ? 'star' : 'star-o'}
            size={size}
            color={color}
          />
        )
      })}
    </View>
  )
}
