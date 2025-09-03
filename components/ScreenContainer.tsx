// components/ScreenContainer.tsx
import sharedStyles from '@/components/shared/styles'
import { useHeaderHeight } from '@react-navigation/elements'
import { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = {
  children: ReactNode
  style?: ViewStyle
  /** iOS: extra offset för navigator-header (skickas från skärmen/layouten) */
}

export default function ScreenContainer({ children }: Props) {
  // const insets = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()

  // iOS behöver ofta kompenseras för headern + ev. top-inset (notch)
  // const verticalOffset = Platform.select({
  //   ios: (keyboardOffset ?? 0) + (insets.top ?? 0),
  //   android: 0,
  // }) as number

  return (
    <SafeAreaView style={sharedStyles.screenContainer} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
