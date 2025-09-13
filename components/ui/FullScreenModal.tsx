// components/ui/FullScreenModal.tsx
import styles from '@/components/ui/styles'
import React from 'react'
import { Modal, Pressable, Text, View, ViewStyle } from 'react-native'

type Props = {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  showClose?: boolean
  contentContainerStyle?: ViewStyle
  dismissOnBackdropPress?: boolean
  /** NYTT: stäng när man trycker i innehållets tomma yta (runt bilden) */
  dismissOnContentPress?: boolean
}

export default function FullScreenModal({
  visible,
  onClose,
  children,
  title,
  showClose = true,
  contentContainerStyle,
  dismissOnBackdropPress = true,
  dismissOnContentPress = false,
}: Props) {
  const ContentWrapper: any = dismissOnContentPress ? Pressable : View

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalWrapper}>
        {showClose && (
          <Pressable onPress={onClose} style={styles.modalCloseBtn} hitSlop={12}>
            <Text style={styles.modalCloseIcon}>×</Text>
          </Pressable>
        )}
        {/* Klick på backdrop stänger (om tillåtet) */}
        <Pressable
          style={styles.modalBackdrop}
          onPress={dismissOnBackdropPress ? onClose : undefined}
        />

        <View style={styles.modalCentered}>
          {/* Klick i content-ytan kan också stänga (men vi låter barn “ta över” om de vill) */}
          <ContentWrapper
            style={contentContainerStyle}
            onPress={dismissOnContentPress ? onClose : undefined}
          >
            {title ? <Text style={styles.modalTitle}>{title}</Text> : null}
            {children}
          </ContentWrapper>
        </View>
      </View>
    </Modal>
  )
}
