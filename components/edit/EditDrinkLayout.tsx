import Styles from '@/assets/styles'
import MasterButton from '@/components/MasterButton'
import ScreenContainer from '@/components/ScreenContainer'
import styles from '@/components/edit/styles'
import { Platform, ScrollView, StyleProp, View, ViewStyle } from 'react-native'

type Props = {
  children: React.ReactNode
  onSave: () => void
  onDelete: () => void
  saveLabel: string
  deleteLabel: string
  containerStyle?: StyleProp<ViewStyle>
}

export default function EditDrinkLayout({
  children,
  onSave,
  onDelete,
  saveLabel,
  deleteLabel,
  containerStyle,
}: Props) {
  return (
    <ScreenContainer>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={[styles.container, containerStyle]}
      >
        {children}

        <View style={{ height: 8 }} />

        <MasterButton title={saveLabel} onPress={onSave} variant="primary" />
        <MasterButton
          title={deleteLabel}
          onPress={onDelete}
          variant="danger"
          style={{ marginTop: Styles.marginPaddingMicro }}
        />
      </ScrollView>
    </ScreenContainer>
  )
}
