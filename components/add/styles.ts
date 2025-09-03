import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  noResults: {
    color: Colors.gray,
    marginLeft: Styles.marginPaddingMain,
    fontSize: Styles.fontSizeMain,
  },
  drinkRow: {
    height: 90,
    borderWidth: Styles.borderWidthCard,
    borderColor: Colors.border,
    borderRadius: Styles.borderRadiusCard,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  row: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between' },
  thumbnail: { height: '100%', aspectRatio: 1, resizeMode: 'cover' },
  middleColumn: {
    flex: 1,
    marginLeft: Styles.marginPaddingSmall,
    justifyContent: 'center',
    paddingVertical: Styles.marginPaddingSmall,
    paddingHorizontal: Styles.marginPaddingMicro,
  },
  detailsTextWrapper: { flexDirection: 'row', alignItems: 'center', gap: Styles.gapLarge },
  detailsText: { fontSize: Styles.fontSizeMain },
  name: { fontSize: Styles.fontSizeButton, fontWeight: '700', color: Colors.black },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Styles.gapSmall,
  },
})

export default styles
