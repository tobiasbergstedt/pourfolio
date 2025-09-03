import sharedStyles from '@/components/shared/styles'
import { ActivityIndicator, Text, View } from 'react-native'

type Props = {
  message?: string
}

export default function LoadingIndicator({ message }: Props) {
  return (
    <View style={sharedStyles.loadingIndicatorContainer}>
      <ActivityIndicator size="large" color="#000" />
      {message && <Text style={sharedStyles.loadingIndicatorMessage}>{message}</Text>}
    </View>
  )
}
