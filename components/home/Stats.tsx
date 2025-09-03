import { useStrings } from '@/providers/I18nProvider'
import { StatsOverviewProps } from '@/types/types'
import { Text, View } from 'react-native'
import styles from './styles'

export default function StatsOverview({ drinks }: StatsOverviewProps) {
  const { t } = useStrings()
  const totalQuantity = drinks.reduce((sum, d) => sum + (d?.quantity ?? 0), 0)
  const variantCount = drinks.length

  return (
    <View style={styles.statsRow}>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>{t.home.total_drinks}</Text>
        <Text style={styles.statNumber}>{totalQuantity}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>{t.home.variants}</Text>
        <Text style={styles.statNumber}>{variantCount}</Text>
      </View>
    </View>
  )
}
