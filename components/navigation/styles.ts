// components/navigation/styles.ts
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  appDrawerContentContainer: {
    flexGrow: 1,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    marginHorizontal: -12,
  },
  appDrawerContentHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Styles.marginPaddingMain,
    paddingVertical: Styles.marginPaddingLarge,
    borderBottomRightRadius: Styles.borderRadiusMain,
    borderTopRightRadius: Styles.borderRadiusMain,
    marginBottom: Styles.borderRadiusSmall,
    marginLeft: -12,
  },
  appDrawerEditLink: {
    position: 'absolute',
    top: Styles.marginPaddingSmall,
    right: Styles.marginPaddingSmall,
    color: Colors.white,
    borderBottomColor: Colors.white,
    borderBottomWidth: 1,
  },
  appDrawerContentProfile: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.white,
    padding: 4,
    borderRadius: 999, // fix: RN kräver nummer, inte '50%'
  },
  appDrawerContentAdminBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 2,
  },
  appDrawerContentHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Styles.gapMedium },
  appDrawerContentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
  },
  appDrawerContentAvatarFallback: { alignItems: 'center', justifyContent: 'center' },
  appDrawerContentAvatarText: {
    color: Colors.black,
    fontWeight: '700',
    fontSize: Styles.fontSizeButton,
  },
  appDrawerUserInfo: { flex: 1 },
  appDrawerContentTitle: { color: Colors.white, fontSize: Styles.fontSizeSmall, marginBottom: 2 },
  appDrawerContentName: { color: Colors.white, fontWeight: '700', fontSize: 18 },
  appDrawerContentAdmin: { fontSize: Styles.fontSizeSmall, color: Colors.white },
  appDrawerContentEmail: { color: Colors.white, fontSize: Styles.fontSizeSmall, marginTop: 2 },

  appDrawerContentSection: {
    // paddingHorizontal: Styles.marginPaddingMain,
    marginTop: Styles.marginPaddingMain,
    marginBottom: 0,
  },
  appDrawerContentSectionTitle: {
    fontSize: Styles.fontSizeMini,
    marginRight: 'auto',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.darkGray,
  },
  appDrawerContentRoutes: { overflow: 'hidden' },
  appDrawerContentRoutesMargin: { marginBottom: 10 },
  appDrawerContentSectionTitleWrapper: { marginHorizontal: 24 },
  appDrawerContentSectionHeaderRow: { marginHorizontal: 24 },
  appDrawerContentQaRow: {
    flexDirection: 'row',
    gap: Styles.gapMain,
    marginBottom: Styles.marginPaddingSmall,
  },
  appDrawerContentCustomEntry: {
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 0,
    minHeight: 48,
    backgroundColor: 'transparent',
    borderLeftWidth: 8,
    justifyContent: 'center',
  },
  appDrawerContentQa: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Styles.borderRadiusModal,
    padding: Styles.marginPaddingSmall,
  },
  appDrawerContentQaIcon: { marginBottom: Styles.marginPaddingMini },
  appDrawerContentQaLabel: { color: Colors.white, fontWeight: '600' },

  appDrawerContentLanguageItem: {
    paddingLeft: 8,
    margin: 0,
    padding: 0,
    minHeight: 46,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },

  appDrawerContentVersionContainer: {
    display: 'flex',
    gap: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Styles.marginPaddingMain,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  appDrawerContentVersion: {
    textAlign: 'center',
    fontSize: Styles.fontSizeMini,
    color: Colors.gray,
  },
  drawerRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: Styles.marginPaddingMain,
  },
})

export default styles
