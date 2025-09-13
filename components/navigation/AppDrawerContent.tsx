// components/navigation/AppDrawerContent.tsx (ny/uppdaterad)
import Colors from '@/assets/colors'
import styles from '@/components/navigation/styles'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useStrings } from '@/providers/I18nProvider'
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer'
import Constants from 'expo-constants'
import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'

function useUser() {
  return { name: 'User', email: 'user@example.com', photoURL: null as string | null }
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={styles.appDrawerContentQa}>
      <View style={styles.appDrawerContentQaIcon}>{icon}</View>
      <Text style={styles.appDrawerContentQaLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

export default function AppDrawerContent(props: DrawerContentComponentProps) {
  const { isAdmin } = useIsAdmin()
  const { t, locale, setLocale } = useStrings()
  const user = useUser()

  const version = Constants.expoConfig?.version
  const build = (Constants.expoConfig as any)?.extra?.build

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingBottom: 12, backgroundColor: Colors.white }}
    >
      {/* Header */}
      <View style={styles.appDrawerContentHeader}>
        <View style={styles.appDrawerContentHeaderRow}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.appDrawerContentAvatar} />
          ) : (
            <View style={[styles.appDrawerContentAvatar, styles.appDrawerContentAvatarFallback]}>
              <Text style={styles.appDrawerContentAvatarText}>{user.name?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.appDrawerContentTitle}>{t.navigation.welcome}</Text>
            <Text style={styles.appDrawerContentName} numberOfLines={1}>
              {user.name}
            </Text>
            {!!user.email && (
              <Text style={styles.appDrawerContentEmail} numberOfLines={1}>
                {user.email}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Snabbåtgärder */}
      <View style={styles.appDrawerContentSection}>
        <Text style={styles.appDrawerContentSectionTitle}>{t.navigation.quick_actions}</Text>
        <View style={styles.appDrawerContentQaRow}>
          <QuickAction
            icon={<FontAwesome5 name="plus-circle" size={18} color={Colors.white} />}
            label={t.navigation.add_drink}
            onPress={() => props.navigation.navigate('add' as never)}
          />
          {isAdmin && (
            <QuickAction
              icon={<MaterialCommunityIcons name="database-plus" size={20} color={Colors.white} />}
              label={t.navigation.add_to_database}
              onPress={() => props.navigation.navigate('admin-add' as never)}
            />
          )}
          {isAdmin && (
            <QuickAction
              icon={
                <MaterialCommunityIcons name="pencil-box-multiple" size={20} color={Colors.white} />
              }
              label={t.navigation.edit_db_drink}
              onPress={() => props.navigation.navigate('admin-edit/index' as never)}
            />
          )}
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.appDrawerContentSection}>
        <Text style={styles.appDrawerContentSectionTitle}>{t.navigation.menu}</Text>
        <View style={{ borderRadius: 14, overflow: 'hidden' }}>
          <DrawerItemList {...props} />
        </View>
      </View>

      {/* Language */}
      <View style={styles.appDrawerContentSection}>
        <Text style={styles.appDrawerContentSectionTitle}>{t.navigation.language}</Text>
        <DrawerItem
          label={t.general.swedish}
          onPress={() => setLocale('sv')}
          icon={({ color, size }) => (
            <MaterialCommunityIcons
              name={locale === 'sv' ? 'check-circle' : 'circle-outline'}
              color={color}
              size={size}
            />
          )}
        />
        <DrawerItem
          label={t.general.english}
          onPress={() => setLocale('en')}
          icon={({ color, size }) => (
            <MaterialCommunityIcons
              name={locale === 'en' ? 'check-circle' : 'circle-outline'}
              color={color}
              size={size}
            />
          )}
        />
      </View>

      {/* Footer */}
      <Text style={styles.appDrawerContentVersion}>
        v{version}
        {build ? ` (${build})` : ''}
      </Text>
    </DrawerContentScrollView>
  )
}
