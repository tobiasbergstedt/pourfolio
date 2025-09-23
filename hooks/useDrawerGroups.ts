import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import { StyleSheet, ViewStyle } from 'react-native'

export function useDrawerGroups(props: DrawerContentComponentProps) {
  // Filtrera bort rutter med drawerItemStyle.display === 'none'
  const visibleRoutes = props.state.routes.filter(r => {
    const opts = props.descriptors[r.key]?.options
    const flat = StyleSheet.flatten(opts?.drawerItemStyle as any) as ViewStyle | undefined
    const display = (flat?.display ?? undefined) as ViewStyle['display'] | undefined
    return display !== 'none'
  })

  const logoutRoute = visibleRoutes.find(r => r.name === 'logout') ?? null
  const adminRoutes = visibleRoutes.filter(r => r.name.startsWith('admin-'))
  const generalRoutes = visibleRoutes.filter(
    r => !r.name.startsWith('admin-') && r.name !== 'logout'
  )

  const currentKey = props.state.routes[props.state.index]?.key

  return { visibleRoutes, generalRoutes, adminRoutes, logoutRoute, currentKey }
}
