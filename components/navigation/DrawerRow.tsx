import Colors from '@/assets/colors'
import styles from '@/components/navigation/styles'
import { Pressable, Text, View } from 'react-native'

export default function DrawerRow({
  focused,
  icon,
  label,
  onPress,
  activeBg = 'transparent',
  inactiveBg = 'transparent',
  showActiveBorder = true, // 👈 ny prop
  activeBorderColor = Colors.primary, // (valfri) om du vill byta färg
}: {
  focused: boolean
  icon?:
    | ((p: { color: string; size: number; focused: boolean }) => React.ReactNode)
    | React.ReactNode
  label: React.ReactNode
  onPress: () => void
  activeBg?: string
  inactiveBg?: string
  showActiveBorder?: boolean // 👈 ny prop
  activeBorderColor?: string // (valfri)
}) {
  const baseColor = focused ? Colors.primary : Colors.darkGray

  const renderIcon = () => {
    if (!icon) return null
    if (typeof icon === 'function') {
      return icon({ color: baseColor, size: 22, focused })
    }
    return icon
  }

  // Bestäm border-värden
  const resolvedBorderColor = focused && showActiveBorder ? activeBorderColor : 'transparent'

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: Colors.primarySuperLight }}
      style={({ pressed }) => [
        styles.appDrawerContentCustomEntry,
        {
          backgroundColor: pressed ? Colors.primarySuperLight : focused ? activeBg : inactiveBg,
          borderColor: resolvedBorderColor,
        },
      ]}
      accessibilityRole="button"
    >
      <View style={styles.drawerRowContainer}>
        {renderIcon()}
        {typeof label === 'string' ? (
          <Text
            numberOfLines={1}
            style={{
              color: baseColor,
              fontSize: 15,
              fontWeight: focused ? '700' : '600',
            }}
          >
            {label}
          </Text>
        ) : (
          label
        )}
      </View>
    </Pressable>
  )
}
