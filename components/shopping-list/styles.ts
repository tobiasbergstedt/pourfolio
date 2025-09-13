import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  shoppingListOuterContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shoppingListContainer: { gap: Styles.gapSmall, marginBottom: Styles.marginPaddingMini },
  shoppingListEmptyPlaceholder: { paddingVertical: Styles.marginPaddingMain, opacity: 0.6 },
  shoppingListButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: Styles.gapMain,
    marginTop: Styles.marginPaddingMini,
  },
  shoppingListButton: { flex: 1 },
  drinkPickerContainer: {
    borderRadius: Styles.borderRadiusCard,
    backgroundColor: Colors.white,
    padding: Styles.marginPaddingSmall,
    borderWidth: Styles.borderWidthCard,
    borderColor: Colors.border,
  },
  noMatchesText: { opacity: 0.6, paddingLeft: Styles.marginPaddingMicro },
  drinkPickerList: { gap: Styles.gapSmall },
  drinkPickerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Styles.borderRadiusCard,
    borderWidth: Styles.borderWidthCard,
    overflow: 'hidden',
  },
  drinkThumb: {
    marginRight: Styles.marginPaddingMain,
    backgroundColor: Colors.superLightBlueGray,
  },
  drinkPickerItemName: { flex: 1 },
  drinkPickerItemNameText: { fontSize: Styles.fontSizeMain, fontWeight: '600' },
  drinkPickerAddIcon: {
    paddingHorizontal: Styles.marginPaddingSmall,
    paddingVertical: Styles.marginPaddingMini,
    borderRadius: Styles.marginPaddingSmall,
    backgroundColor: Colors.primary,
    marginRight: Styles.marginPaddingMain,
  },
  drinkPickerAddIconPressed: {
    opacity: 0.8,
  },
  removeMarkedButton: {
    marginVertical: Styles.marginPaddingSmall,
  },
  shoppingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Styles.marginPaddingSmall,
    borderRadius: Styles.borderRadiusCard,
    backgroundColor: Colors.white,
    borderWidth: Styles.borderWidthCard,
    borderColor: Colors.border,
  },
  shoppingItemTextContainer: { flex: 1, marginLeft: Styles.marginPaddingSmall },
  shoppingItemName: {
    fontSize: Styles.fontSizeMain,
    fontWeight: '600',
  },
  shoppingItemAmount: { marginTop: 2, opacity: 0.6 },
  shoppingItemIconsContainer: { flexDirection: 'row', alignItems: 'center', gap: Styles.gapMain },
  shoppingItemAmountIcon: {
    padding: Styles.marginPaddingMicro,
    borderRadius: Styles.borderRadiusSmall,
    backgroundColor: Colors.superLightGray,
  },
  shoppingItemRemoveIcon: {
    padding: Styles.marginPaddingMicro,
    borderRadius: Styles.borderRadiusSmall,
    backgroundColor: Colors.dangerLight,
  },
})

export default styles
