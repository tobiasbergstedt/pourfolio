// home/styles.ts
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  screen: { flex: 1 }, // använd som ScrollView.style
  content: { paddingVertical: Styles.marginPaddingMain },
  item: {
    height: 72, // ← eller 72, 96 etc. beroende på din layout
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: Styles.borderWidthCard,
    overflow: 'hidden',
  },
  name: { fontWeight: 'bold', fontSize: Styles.fontSizeButton },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  thumbnail: {
    height: '100%', // gör att den fyller höjden i sin rad
    aspectRatio: 1, // behåller proportionerna (1:1 i detta fall)
    resizeMode: 'cover',
  },
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  welcomeText: {
    fontSize: Styles.fontSizeTitle,
    fontWeight: 'black',
    marginBottom: Styles.marginPaddingMain,
    marginLeft: Styles.marginPaddingMini,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.superLightGray,
    borderRadius: Styles.borderRadiusMain,
    paddingHorizontal: Styles.marginPaddingLarge,
    paddingVertical: Styles.marginPaddingMicro,
    marginBottom: Styles.marginPaddingMini,
  },
  searchIcon: {
    marginRight: Styles.marginPaddingMini,
    color: Colors.gray,
    fontSize: Styles.fontSizeTitle,
  },
  searchInput: {
    backgroundColor: Colors.superLightGray,
    borderRadius: Styles.borderRadiusSmall,
    padding: Styles.marginPaddingSmall,
    fontSize: Styles.fontSizeButton,
    flex: 1,
    color: Colors.black,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 50,
    gap: Styles.gapMain,
    marginBottom: Styles.marginPaddingMini,
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Styles.marginPaddingMini,
    paddingHorizontal: Styles.marginPaddingSmall,
    borderRadius: Styles.borderRadiusMain,
    flex: 1,
    justifyContent: 'center',
    gap: Styles.gapSmall,
  },
  buttonAddToDatabase: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Styles.marginPaddingMini,
    paddingHorizontal: Styles.marginPaddingSmall,
    borderRadius: Styles.borderRadiusMain,
    justifyContent: 'center',
    marginTop: 'auto',
  },
  buttonAddToDatabaseText: {
    color: Colors.superLightGray,
    fontWeight: 'bold',
    fontSize: Styles.fontSizeButton,
  },
  plusIcon: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimaryText: {
    marginLeft: 8,
    color: Colors.superLightGray,
    fontWeight: 'bold',
    fontSize: Styles.fontSizeButton,
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.superLightGray,
    paddingVertical: Styles.marginPaddingMini,
    paddingHorizontal: Styles.marginPaddingSmall,
    borderRadius: Styles.borderRadiusMain,
    flex: 1,
    justifyContent: 'center',
    gap: Styles.gapSmall,
  },
  buttonSecondaryText: {
    marginLeft: Styles.marginPaddingMini,
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: Styles.fontSizeButton,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Styles.gapMain,
    marginBottom: Styles.marginPaddingMain,
    marginTop: Styles.marginPaddingMini,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderWidth: Styles.borderWidthCard,
    borderRadius: Styles.borderRadiusCard,
    padding: Styles.marginPaddingMain,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Styles.fontSizeMain,
    fontWeight: 600,
    color: Colors.black,
    marginTop: 4,
    textAlign: 'center',
  },
  statNumber: {
    fontSize: Styles.fontSizeLarge,
    fontWeight: 600,
    color: Colors.primary,
  },
  middleColumn: {
    flex: 1,
    marginLeft: Styles.marginPaddingSmall,
    justifyContent: 'center',
    paddingVertical: Styles.marginPaddingSmall,
    paddingHorizontal: Styles.marginPaddingMicro,
  },
  detailsTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    color: Colors.gray,
    fontSize: Styles.fontSizeMain,
    marginLeft: Styles.marginPaddingLarge,
  },
  alcoholFreeLabel: {
    fontSize: Styles.fontSizeMini,
    color: Colors.gray,
    fontStyle: 'italic',
    marginTop: 2,
  },
  quantity: {
    fontWeight: 'bold',
    fontSize: Styles.fontSizeMain,
    color: Colors.primary,
    alignSelf: 'center',
    paddingRight: Styles.marginPaddingMain,
    paddingLeft: 4,
  },
  emptyMessageContainer: {
    paddingVertical: Styles.marginPaddingMini,
    paddingHorizontal: Styles.marginPaddingLarge,
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: Styles.fontSizeMain,
    color: Colors.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  listWrapper: {
    // marginBottom: Styles.marginPaddingSmall,
  },
})

export default styles
