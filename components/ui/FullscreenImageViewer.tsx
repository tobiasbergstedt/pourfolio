import styles from '@/components/ui/styles'
import FullScreenModal from './FullScreenModal'
import ZoomableImage from './ZoomableImage'

type Props = {
  visible: boolean
  onClose: () => void
  uri: string
}

export default function FullscreenImageViewer({ visible, onClose, uri }: Props) {
  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      showClose={true}
      dismissOnBackdropPress={true}
      contentContainerStyle={styles.imageViewerModalContent}
    >
      <ZoomableImage uri={uri} />
    </FullScreenModal>
  )
}
