import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { Platform, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  imageViewerModalContent: {
    padding: 0,
  },
  donutGaugeCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalWrapper: { flex: 1 },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.blackOpaque50,
  },
  modalCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '92%',
    borderRadius: Styles.borderRadiusMain,
    backgroundColor: Colors.white,
    padding: Styles.marginPaddingMain,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: Styles.borderRadiusModal,
      },
      android: { elevation: 6 },
    }),
  },
  modalFullscreenContent: {
    flex: 1,
    backgroundColor: Colors.blackOpaque50,
  },
  modalCloseBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: Styles.borderRadiusModal,
    backgroundColor: Colors.blackOpaque35,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  modalCloseIcon: { color: 'white', fontSize: Styles.fontSizeTitle, lineHeight: 22, marginTop: -2 },
  modalTitle: {
    fontWeight: '700',
    fontSize: Styles.fontSizeMain,
    marginBottom: Styles.marginPaddingMini,
    color: Colors.black,
  },
  zoomableImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default styles
