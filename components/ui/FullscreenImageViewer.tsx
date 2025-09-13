// components/ui/FullscreenImageViewer.tsx
import styles from '@/components/ui/styles'
import { Pressable, Text, View, useWindowDimensions } from 'react-native'
import FullScreenModal from './FullScreenModal'
import ZoomableImage from './ZoomableImage'

type Props = {
  visible: boolean
  onClose: () => void
  uri: string | null
}

export default function FullscreenImageViewer({ visible, onClose, uri }: Props) {
  const { width: winW, height: winH } = useWindowDimensions()
  const boxW = Math.min(winW * 0.92, 720) // maxbredd (valfritt tak)
  const maxBoxH = winH * 0.86 // MAX-höjd, inte fast

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      showClose={true}
      dismissOnBackdropPress={true}
      contentContainerStyle={styles.imageViewerModalContent}
    >
      {/* Tryck i tom yta INOM content stänger — men vi sätter INGEN fast höjd här */}
      <Pressable
        style={[
          styles.imageViewerModalContentInner,
          {
            width: boxW,
            maxHeight: maxBoxH,
          },
        ]}
        onPress={onClose}
      >
        {uri ? (
          // Denna wrapper fångar touch på själva bilden så det inte bubblar upp och stänger
          <View onStartShouldSetResponder={() => true}>
            <ZoomableImage uri={uri} maxW={boxW} maxH={maxBoxH} />
          </View>
        ) : (
          <Text />
        )}
      </Pressable>
    </FullScreenModal>
  )
}
