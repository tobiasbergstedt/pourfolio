import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import DrawerRow from '@/components/navigation/DrawerRow'
import styles from '@/components/navigation/styles'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  t: any
  logoutRoute: DrawerContentComponentProps['state']['routes'][number] | null
  navigate: (name: string) => void
}

export default function LogoutRow({ t, logoutRoute, navigate }: Props) {
  if (!logoutRoute) return null

  return (
    <View style={[styles.appDrawerContentSection, { paddingTop: Styles.marginPaddingHuge }]}>
      <DrawerRow
        focused={false}
        showActiveBorder={false}
        icon={({ size }) => (
          <MaterialCommunityIcons name="logout" size={size} color={Colors.logoutForeground} />
        )}
        label={
          <Text style={{ color: Colors.logoutForeground, fontWeight: '700', fontSize: 15 }}>
            {t.navigation.sign_out}
          </Text>
        }
        onPress={() => navigate('logout')}
        activeBg={Colors.logoutBackground}
        inactiveBg={Colors.logoutBackground}
      />
    </View>
  )
}
