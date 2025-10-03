// components/lists/styles.ts
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  listsContainer: {
    paddingTop: Styles.marginPaddingMain,
    paddingBottom: Styles.marginPaddingLarger,
    gap: Styles.gapMedium,
  },
  listsGap: { gap: Styles.gapMain },
  listsListItem: {
    padding: Styles.marginPaddingSmall,
    borderRadius: Styles.borderRadiusCard,
    backgroundColor: Colors.superDuperLightGray,
    borderWidth: Styles.borderWidthCard,
    gap: Styles.gapMain,
  },
  listsListItemPressable: { flexDirection: 'row', justifyContent: 'space-between' },
  listsListItemText: { fontWeight: '600' },
  listsTextInput: {
    backgroundColor: 'white',
    borderRadius: Styles.borderRadiusSmall,
    padding: Styles.marginPaddingSmall,
    borderWidth: Styles.borderWidthThin,
    borderColor: Colors.lightGray,
  },
  listsModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50,
    gap: Styles.gapMain,
    marginBottom: Styles.marginPaddingMini,
  },
  listsModalButton: { flex: 1, minWidth: 0 },
  listsLeaveText: { color: Colors.mediumGray },
  listsModalBackdrop: {
    flex: 1,
    backgroundColor: Colors.blackOpaque35,
    justifyContent: 'center',
    padding: Styles.marginPaddingLarge,
  },
  listsModalContent: {
    backgroundColor: Colors.white,
    borderRadius: Styles.borderRadiusModal,
    padding: Styles.marginPaddingMain,
  },
  listsModalTextHeader: {
    fontWeight: '700',
    fontSize: Styles.fontSizeMain,
    marginBottom: Styles.marginPaddingMini,
  },
  listsModalText: { marginBottom: Styles.marginPaddingSmall },
  listsModalTarget: { fontWeight: '700' },
  listSwitcherBackdrop: {
    flex: 1,
    backgroundColor: Colors.blackOpaque35,
    justifyContent: 'flex-end',
  },
  listSwitcherSheet: {
    backgroundColor: Colors.white,
    padding: Styles.marginPaddingLarge,
    borderTopLeftRadius: Styles.borderRadiusModal,
    borderTopRightRadius: Styles.borderRadiusModal,
    maxHeight: '70%',
  },
  listSwitcherTitle: {
    fontWeight: '700',
    fontSize: Styles.fontSizeButton,
    marginBottom: Styles.marginPaddingSmall,
  },
  listSwitcherRow: {
    padding: Styles.marginPaddingSmall,
    backgroundColor: Colors.superDuperLightGray,
    borderRadius: Styles.borderRadiusCard,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  listSwitcherRowText: { fontSize: Styles.fontSizeMain, fontWeight: '600' },
  listSwitcherRole: { fontSize: Styles.fontSizeMini, color: Colors.mediumGray },
  listSwitcherSeparator: { height: 8 },
})

export default styles
