// home/styles.ts
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  profileLoadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileContentContainer: {
    paddingVertical: Styles.marginPaddingMain,
    gap: Styles.marginPaddingSmall,
  },
  profilePhotoContainer: { alignItems: 'center', gap: Styles.gapMain },
  profilePhotoImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: Colors.superLightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoImageFallbackText: { fontSize: 36, color: Colors.gray },
  profileNameRow: { flexDirection: 'row', gap: Styles.gapMain },
  profileNameRowCard: { flex: 1 },
  profileEmailText: { paddingVertical: 10, color: Colors.gray },
  profileButtonRow: {
    flexDirection: 'row',
    gap: Styles.gapMain,
    marginTop: Styles.marginPaddingSmall,
  },
  profileButton: { flex: 1 },
})

export default styles
