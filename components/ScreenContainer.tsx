// components/ScreenContainer.tsx
import sharedStyles from '@/components/shared/styles'
import { useHeaderHeight } from '@react-navigation/elements'
import { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = {
  children: ReactNode
  style?: ViewStyle
}

export default function ScreenContainer({ children }: Props) {
  const headerHeight = useHeaderHeight()

  return (
    <SafeAreaView style={sharedStyles.screenContainer} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
