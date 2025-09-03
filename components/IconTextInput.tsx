import Colors from '@/assets/colors'
import sharedStyles from '@/components/shared/styles'
import { IconTextInputProps } from '@/types/types'
import { FontAwesome5 } from '@expo/vector-icons'
import { useState } from 'react'
import { TextInput, View } from 'react-native'

export default function IconTextInput({ icon, style, ...props }: IconTextInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={sharedStyles.iconTextInputContainer}>
      <FontAwesome5
        name={icon}
        size={18}
        color={focused ? Colors.primary : Colors.gray}
        style={sharedStyles.iconTextInputIcon}
      />
      <TextInput
        {...props}
        placeholderTextColor={Colors.gray}
        style={[sharedStyles.iconTextInputInput, style]}
        onFocus={e => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={e => {
          setFocused(false)
          props.onBlur?.(e)
        }}
      />
    </View>
  )
}
