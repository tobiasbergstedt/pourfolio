import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  typeCell: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    borderRadius: Styles.borderRadiusCard,
    overflow: 'hidden',
  },
  typeCellActive: { borderColor: Colors.primary },
  typeIcon: {
    width: 64,
    height: 64,
  },
  typeIconFallback: { backgroundColor: Colors.superLightGray },
  typeText: {
    color: Colors.black,
    maxWidth: 120,
    flexGrow: 1,
    textAlign: 'center',
  },
  typeTextActive: { color: Colors.primary },
  addDrinkImageContainer: { flex: 1, padding: Styles.marginPaddingLarge, gap: Styles.gapMain },
  addDrinkImageInput: {
    borderWidth: Styles.borderWidthThin,
    borderColor: Colors.lightGray,
    padding: Styles.marginPaddingMini,
    borderRadius: Styles.borderRadiusMini,
  },
  addDrinkImageImage: {
    width: 150,
    height: 150,
    borderRadius: Styles.borderRadiusSmall,
    alignSelf: 'center',
    marginVertical: Styles.marginPaddingMini,
  },
  copyRightFooter: {
    textAlign: 'center',
    color: Colors.gray,
    fontSize: Styles.fontSizeMini,
    marginTop: Styles.marginPaddingLarger,
  },
  // drar ut raden till kanterna men ger den också en minhöjd
  drinkCategoriesWrap: {
    marginLeft: -Styles.marginPaddingMain,
    marginRight: -Styles.marginPaddingMain,
    marginBottom: Styles.marginPaddingMain,
  },
  drinkCategoriesScrollView: {
    // ingen flexGrow här – låt innehållet styra höjden
  },
  drinkCategoriesRow: {
    paddingHorizontal: Styles.marginPaddingMain,
    alignItems: 'center',
  },
  drinkCategoriesItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64, // valfritt: gör träffytan lite större
  },
  drinkCategoriesLabel: {
    fontSize: Styles.fontSizeSmall,
    lineHeight: 18,
    color: Colors.darkGray,
    marginTop: 4,
    maxWidth: 90, // valfritt: skydda mot väldigt långa texter
  },
  drinkCategoriesSelectedLabel: { color: Colors.primary },
  iconTextInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.superLightGray,
    borderRadius: Styles.borderRadiusMain,
    paddingHorizontal: Styles.marginPaddingLarge,
    paddingVertical: 4,
    marginBottom: Styles.marginPaddingMini,
  },
  iconTextInputIcon: {
    fontSize: Styles.fontSizeTitle,
    marginRight: Styles.marginPaddingMicro,
  },
  iconTextInputInput: {
    backgroundColor: Colors.superLightGray,
    borderRadius: Styles.borderRadiusSmall,
    padding: Styles.marginPaddingSmall,
    fontSize: Styles.fontSizeButton,
    flex: 1,
    color: Colors.gray,
  },
  infoCard: {
    flex: 1,
    borderColor: Colors.border,
    borderWidth: Styles.borderWidthCard,
    borderRadius: Styles.borderRadiusCard,
    padding: Styles.marginPaddingMain,
    backgroundColor: Colors.white,
  },
  infoCardLabel: {
    fontSize: Styles.fontSizeMain,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Styles.marginPaddingMicro,
  },
  loadingIndicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingIndicatorMessage: {
    marginTop: Styles.marginPaddingSmall,
    fontSize: Styles.fontSizeMain,
    color: Colors.darkGray,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Styles.marginPaddingMain,
  },
})

export default styles
