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
}

export default function FullScreenModal({
  visible,
  onClose,
  children,
  title,
  showClose = true,
  contentContainerStyle,
  dismissOnBackdropPress = true,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalWrapper}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={dismissOnBackdropPress ? onClose : undefined}
        />
        <View style={styles.modalCentered}>
          <View style={contentContainerStyle}>
            {showClose && (
              <Pressable onPress={onClose} style={styles.modalCloseBtn} hitSlop={12}>
                <Text style={styles.modalCloseIcon}>×</Text>
              </Pressable>
            )}
            {title ? <Text style={styles.modalTitle}>{title}</Text> : null}
            {children}
          </View>
        </View>
      </View>
    </Modal>
  )
}
