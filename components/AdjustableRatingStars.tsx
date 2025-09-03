// components/AdjustableRatingStars.tsx
import Colors from '@/assets/colors'
import { FontAwesome5 } from '@expo/vector-icons'
import { TouchableOpacity, View } from 'react-native'

type Props = {
  rating: number
  onRate?: (newRating: number) => void
  size?: number
}

export default function AdjustableRatingStars({ rating, onRate, size = 20 }: Props) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => onRate?.(star)} disabled={!onRate}>
          <FontAwesome5
            name={'star'}
            solid={rating >= star}
            size={size}
            color={rating >= star ? Colors.primary : Colors.gray}
            style={{ marginRight: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  )
}
