// app/_layout.tsx
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import BackButton from '@/components/BackButton'
import AppDrawerContent from '@/components/navigation/AppDrawerContent'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { I18nProvider, useStrings } from '@/providers/I18nProvider'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Slot, useSegments } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { ActivityIndicator, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AuthGate from '../components/AuthGate'

function AppDrawer() {
  const { isAdmin, loading } = useIsAdmin()
  const { t } = useStrings()
  const segments = useSegments() as string[]
  const isPublic = segments[0] === '(public)'

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  if (isPublic) return <Slot />

  return (
    <AuthGate>
      <Drawer
        // 🛟 Stabilare drawer under Fabric:
        // useLegacyImplementation
        // 🧊 Undvik att “ta bort” vy-hierarkier som sen uppdateras → minskar viewState-krockar:
        detachInactiveScreens={false}
        drawerContent={props => <AppDrawerContent {...props} />}
        screenOptions={{
          headerTitleAlign: 'center',
          drawerActiveTintColor: Colors.primary,
          drawerInactiveTintColor: Colors.darkGray,
          drawerActiveBackgroundColor: '#F4F0FF',
          drawerLabelStyle: { fontSize: 15, fontWeight: '600' },
          drawerStyle: {
            width: 300,
            backgroundColor: Colors.white,
            borderTopRightRadius: Styles.borderRadiusMain,
            borderBottomRightRadius: 24,
            overflow: 'hidden',
          },
          overlayColor: 'rgba(20,16,40,0.3)',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: t.navigation.home,
            title: t.navigation.home,
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="add"
          options={{
            drawerLabel: t.navigation.add_drink,
            title: t.navigation.add_drink,
            headerLeft: ({ tintColor }) => <BackButton color={tintColor ?? 'black'} />,
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="plus-circle-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="edit"
          options={{
            drawerLabel: t.navigation.edit_drink,
            title: t.navigation.edit_drink,
            headerLeft: ({ tintColor }) => <BackButton color={tintColor ?? 'black'} />,
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="pencil" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="shopping-list"
          options={{
            drawerLabel: t.navigation.shopping_list,
            title: t.navigation.shopping_list,
            headerLeft: ({ tintColor }) => <BackButton color={tintColor ?? 'black'} />,
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="format-list-bulleted" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="admin-add"
          options={{
            drawerLabel: t.navigation.add_to_database,
            title: t.navigation.add_to_database,
            headerLeft: ({ tintColor }) => <BackButton color={tintColor ?? 'black'} />,
            drawerItemStyle: { display: isAdmin ? 'contents' : 'none' },
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="database-plus-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="admin-edit"
          options={{
            drawerLabel: t.navigation.edit_db_drink,
            title: t.navigation.edit_db_drink,
            headerShown: false, // 👈 hide Drawer header for this group
            drawerItemStyle: { display: isAdmin ? 'contents' : 'none' },
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="database-edit-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="admin-categories"
          options={{
            drawerLabel: t.navigation.edit_category,
            title: t.navigation.edit_category,
            headerShown: false, // 👈 hide Drawer header for this group
            drawerItemStyle: { display: isAdmin ? 'contents' : 'none' },
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="shape-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: t.navigation.profile,
            title: t.navigation.profile,
            headerLeft: ({ tintColor }) => <BackButton color={tintColor ?? 'black'} />,
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="logout"
          options={{
            drawerLabel: t.navigation.sign_out,
            title: t.navigation.sign_out,
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="logout" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="(public)"
          options={{
            drawerLabel: t.navigation.public,
            title: t.navigation.public,
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="earth" color={color} size={size} />
            ),
          }}
        />
      </Drawer>
    </AuthGate>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <AppDrawer />
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
