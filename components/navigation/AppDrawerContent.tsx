// components/navigation/AppDrawerContent.tsx (ny/uppdaterad)
import Colors from '@/assets/colors'
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
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

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
    <Pressable onPress={onPress} style={s.qa}>
      <View style={s.qaIcon}>{icon}</View>
      <Text style={s.qaLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

export default function AppDrawerContent(props: DrawerContentComponentProps) {
  const { isAdmin } = useIsAdmin()
  const { t, locale, setLocale } = useStrings()
  const user = useUser()

  const version = Constants.expoConfig?.version ?? ''
  const build = (Constants.expoConfig as any)?.extra?.build ?? ''

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingBottom: 12, backgroundColor: Colors.white }}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Text style={s.avatarTxt}>{user.name?.[0]?.toUpperCase() ?? 'U'}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{t.navigation.welcome}</Text>
            <Text style={s.name} numberOfLines={1}>
              {user.name}
            </Text>
            {!!user.email && (
              <Text style={s.email} numberOfLines={1}>
                {user.email}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Snabbåtgärder */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t.navigation.quick_actions}</Text>
        <View style={s.qaRow}>
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
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t.navigation.menu ?? 'Meny'}</Text>
        <View style={{ borderRadius: 14, overflow: 'hidden' }}>
          <DrawerItemList {...props} />
        </View>
      </View>

      {/* Language */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t.navigation.language}</Text>
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
      <Text style={s.version}>
        v{version}
        {build ? ` (${build})` : ''}
      </Text>
    </DrawerContentScrollView>
  )
}

const s = StyleSheet.create({
  header: {
    backgroundColor: '#6C4EFF',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
    marginBottom: 8,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#111', fontWeight: '700', fontSize: 18 },
  title: { color: '#EAE4FF', fontSize: 12, marginBottom: 2 },
  name: { color: '#fff', fontWeight: '700', fontSize: 18 },
  email: { color: '#EAE4FF', fontSize: 12, marginTop: 2 },

  section: { paddingHorizontal: 16, marginTop: 10 },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.gray,
  },

  qaRow: { flexDirection: 'row', gap: 10 },
  qa: { flex: 1, backgroundColor: Colors.primary, borderRadius: 14, padding: 12 },
  qaIcon: { marginBottom: 8 },
  qaLabel: { color: Colors.white, fontWeight: '600' },

  version: { textAlign: 'center', fontSize: 12, marginTop: 12, color: Colors.gray },
})
