// home/EmptyMessage.tsx
import { Text, View } from 'react-native'
import styles from './styles'

export default function EmptyMessage({ text }: { text: string }) {
  return (
    <View style={styles.emptyMessageContainer}>
      <Text style={styles.emptyMessage}>{text}</Text>
    </View>
  )
}
