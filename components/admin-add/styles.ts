import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  preview: { width: 128, height: 128, borderRadius: Styles.borderRadiusCard, alignSelf: 'center' },
  list: { gap: Styles.gapMain },
  row: { flexDirection: 'row', gap: Styles.gapMain },
  removeButton: { alignSelf: 'center', padding: Styles.marginPaddingMini },
  removeButtonText: { color: Colors.primary, fontWeight: '600' },
  addRow: { alignSelf: 'flex-start', padding: Styles.marginPaddingMini },
  addRowText: { color: Colors.primary, fontWeight: '600' },
})

export default styles
