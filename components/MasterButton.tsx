import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import { MasterButtonProps } from '@/types/types'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function MasterButton({
  onPress,
  title,
  disabled = false,
  variant = 'primary',
  size = 'full',
  icon,
  inline = false,
  style,
}: MasterButtonProps) {
  const buttonStyles = [
    styles.base,
    inline || size === 'auto' ? styles.auto : styles.full,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'danger' && styles.danger,
    variant === 'text' && styles.textOnly,
    disabled && styles.disabled,
  ].filter(Boolean)

  const textStyles = [
    styles.text,
    variant === 'text' && styles.textLink,
    variant === 'secondary' && { color: Colors.primary },
  ]

  const outlineColor =
    variant === 'primary'
      ? Colors.primary
      : variant === 'secondary'
        ? Colors.superLightGray
        : Colors.primary // fallback

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        buttonStyles,
        style, // ← extern style här
        pressed && {
          outlineWidth: 1,
          outlineColor,
        },
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text style={textStyles}>{title}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Styles.marginPaddingSmall,
    borderRadius: Styles.borderRadiusMain,
    alignItems: 'center',
    outlineWidth: 0,
    justifyContent: 'center',
  },
  full: {
    width: '100%',
  },
  auto: {
    alignSelf: 'flex-start',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.superLightGray,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  textOnly: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    textAlign: 'right',
    alignItems: 'flex-end',
    marginTop: -6,
    marginBottom: Styles.marginPaddingLarge,
    marginRight: Styles.marginPaddingSmall,
    paddingVertical: 0,
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: Styles.fontSizeButton,
  },
  textLink: {
    color: Colors.primary,
    fontWeight: 'normal',
    fontSize: Styles.fontSizeSmall,
    fontStyle: 'italic',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
