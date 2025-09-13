import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  adminCategoryRowPressable: {
    height: 72,
    borderWidth: Styles.borderWidthCard,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  adminCategoryRowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Styles.gapMain,
  },
  adminCategoryRowIcon: { width: 72, height: 72, backgroundColor: Colors.superLightGray },
  adminCategoryRowTextWrap: { flex: 1, paddingHorizontal: Styles.marginPaddingSmall },
  adminCategoryRowTitle: {
    fontSize: Styles.marginPaddingMain,
    fontWeight: '700',
    color: Colors.black,
  },
  adminCategoryRowId: { fontSize: Styles.fontSizeMini, color: Colors.gray },
  adminCategoryRowChevron: {
    paddingHorizontal: Styles.marginPaddingSmall,
    color: Colors.gray,
    fontSize: Styles.fontSizeTitle,
    fontWeight: '500',
  },
  adminDrinkRowContainer: {
    minHeight: 72,
    borderWidth: Styles.borderWidthCard,
    borderColor: Colors.border,
    borderRadius: Styles.borderRadiusCard,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  adminDrinkRowThumb: { width: 72, height: 72, resizeMode: 'cover' },
  adminDrinkRowName: { fontSize: Styles.fontSizeMain, fontWeight: '700', color: Colors.black },
  adminDrinkRowSub: { fontSize: Styles.fontSizeSmall, color: Colors.gray, marginTop: 2 },
  adminDrinkRowChevron: {
    paddingHorizontal: Styles.marginPaddingSmall,
    color: Colors.gray,
    fontSize: Styles.fontSizeTitle,
    fontWeight: '500',
  },
})

export default styles
