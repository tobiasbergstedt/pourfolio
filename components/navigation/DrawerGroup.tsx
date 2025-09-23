import Colors from '@/assets/colors'
import DrawerRow from '@/components/navigation/DrawerRow'
import styles from '@/components/navigation/styles'
import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  title: string
  routes: DrawerContentComponentProps['state']['routes']
  drawerProps: DrawerContentComponentProps
}

export default function DrawerGroup({ title, routes, drawerProps }: Props) {
  const currentKey = drawerProps.state.routes[drawerProps.state.index]?.key

  return (
    <View style={[styles.appDrawerContentSection, styles.appDrawerContentRoutesMargin]}>
      <View style={styles.appDrawerContentSectionHeaderRow}>
        <Text style={styles.appDrawerContentSectionTitle}>{title}</Text>
      </View>

      <View style={styles.appDrawerContentRoutes}>
        {routes.map(r => {
          const d = drawerProps.descriptors[r.key]?.options ?? {}
          const focused = r.key === currentKey

          const baseLabel =
            d.drawerLabel !== undefined ? d.drawerLabel : d.title !== undefined ? d.title : r.name

          const label =
            typeof baseLabel === 'function'
              ? baseLabel({ color: focused ? Colors.primary : Colors.darkGray, focused })
              : String(baseLabel)

          return (
            <DrawerRow
              key={r.key}
              focused={focused}
              icon={d.drawerIcon}
              label={label}
              onPress={() => drawerProps.navigation.navigate(r.name as never)}
            />
          )
        })}
      </View>
    </View>
  )
}
