// components/edit/styles.ts
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    paddingVertical: Styles.marginPaddingMain,
    gap: Styles.gapMain,
  },

  // Dubbelkortrad
  cardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: Styles.gapMain,
  },
  headerCard: {
    paddingBottom: Styles.marginPaddingSmall,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Styles.gapLarge,
  },
  thumbnail: {
    borderRadius: Styles.borderRadiusCard,
    backgroundColor: 'transparent',
  },
  headerTextColumn: {
    flex: 1,
  },
  name: {
    fontSize: Styles.fontSizeTitle,
    fontWeight: 'bold',
    color: Colors.black,
  },
  brand: {
    marginTop: 2,
    fontSize: Styles.fontSizeSmall,
    color: Colors.gray,
  },

  // Betyg
  starsRow: {
    marginTop: Styles.marginPaddingMini,
  },
  label: {
    fontSize: Styles.fontSizeSmall,
    fontWeight: '600',
    color: Colors.gray,
    marginBottom: Styles.marginPaddingMicro,
  },
  ratingSummary: {
    fontSize: Styles.fontSizeSmall,
    color: Colors.gray,
    marginTop: Styles.marginPaddingMini,
  },

  staticField: {
    fontSize: Styles.fontSizeMain,
    color: Colors.black,
  },

  // Amount
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Styles.gapMain,
  },
  qtyButton: {
    width: 48,
    height: 48,
    borderRadius: Styles.borderRadiusCard,
    padding: 0,
  },
  quantityInput: {
    flex: 1,
    borderWidth: Styles.borderWidthThin,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingVertical: Styles.marginPaddingSmall,
    borderRadius: Styles.borderRadiusCard,
    textAlign: 'center',
    fontSize: Styles.fontSizeButton,
    fontWeight: '600',
    color: Colors.black,
  },
  textInput: {
    borderWidth: Styles.borderWidthThin,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    borderRadius: Styles.borderRadiusCard,
    padding: Styles.marginPaddingSmall,
    fontSize: Styles.fontSizeButton,
    flex: 1,
    color: Colors.black,
  },

  propertyList: { gap: Styles.gapMedium, flexDirection: 'row' },
  propertyItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Styles.gapMain,
    flex: 1,
    minWidth: 0,
  },
  propertyLeft: { flexDirection: 'row', alignItems: 'center', gap: Styles.gapMain, flexShrink: 1 },
  propertyIcon: { opacity: 0.75 },
  propertyName: { fontSize: Styles.fontSizeMain, fontWeight: '600', flexShrink: 1 },
  propertyValueCenterText: { fontSize: Styles.fontSizeMini, fontWeight: '600', opacity: 0.9 },
})

export default styles
