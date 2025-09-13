// home/styles.ts
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  appDrawerContentContainer: {
    paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  appDrawerContentHeader: {
    backgroundColor: Colors.userCard,
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
  appDrawerContentTitle: { color: Colors.white, fontSize: Styles.fontSizeMini, marginBottom: 2 },
  appDrawerContentName: { color: Colors.white, fontWeight: '700', fontSize: 18 },
  appDrawerContentEmail: { color: Colors.white, fontSize: Styles.fontSizeMini, marginTop: 2 },

  appDrawerContentSection: {
    paddingHorizontal: Styles.marginPaddingMain,
    marginTop: Styles.marginPaddingMini,
  },
  appDrawerContentSectionTitle: {
    fontSize: Styles.fontSizeMini,
    marginBottom: Styles.marginPaddingMicro,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.gray,
  },

  appDrawerContentQaRow: {
    flexDirection: 'row',
    gap: Styles.gapMain,
    marginBottom: Styles.marginPaddingSmall,
  },
  appDrawerContentQa: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Styles.borderRadiusModal,
    padding: Styles.marginPaddingSmall,
  },
  appDrawerContentQaIcon: { marginBottom: Styles.marginPaddingMini },
  appDrawerContentQaLabel: { color: Colors.white, fontWeight: '600' },

  appDrawerContentVersion: {
    textAlign: 'center',
    fontSize: Styles.fontSizeMini,
    marginTop: Styles.marginPaddingSmall,
    color: Colors.gray,
  },
})

export default styles
