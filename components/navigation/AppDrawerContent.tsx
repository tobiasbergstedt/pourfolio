import DrawerGroup from '@/components/navigation/DrawerGroup'
import FooterVersion from '@/components/navigation/FooterVersion'
import HeaderCard from '@/components/navigation/HeaderCard'
import LanguageSection from '@/components/navigation/LanguageSection'
import LogoutRow from '@/components/navigation/LogoutRow'
import styles from '@/components/navigation/styles'
import { useDrawerGroups } from '@/hooks/useDrawerGroups'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useUser } from '@/hooks/useUser'
import { useStrings } from '@/providers/I18nProvider'
import { useImageUrl } from '@/utils/images'
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer'
import Constants from 'expo-constants'
import React, { useMemo as useReactMemo } from 'react'
import { View } from 'react-native'

export default function AppDrawerContent(props: DrawerContentComponentProps) {
  const { isAdmin } = useIsAdmin()
  const { t, locale, setLocale } = useStrings()
  const user = useUser()

  const version = Constants.expoConfig?.version
  const build = (Constants.expoConfig as any)?.extra?.build

  const goToProfile = () => {
    props.navigation.navigate('profile' as never)
  }

  const rawAvatarSource = useReactMemo(() => user.photoURL ?? null, [user.photoURL])
  const { url: avatarUrl } = useImageUrl(rawAvatarSource, 64)

  const { generalRoutes, adminRoutes, logoutRoute } = useDrawerGroups(props)

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.appDrawerContentContainer}>
      <HeaderCard goToProfile={goToProfile} t={t} user={user} avatarUrl={avatarUrl} />

      {/* Navigation – Allmänt */}
      <DrawerGroup title={t.navigation.menu} routes={generalRoutes} drawerProps={props} />

      {/* Admin */}
      {isAdmin && adminRoutes.length > 0 && (
        <DrawerGroup title={t.navigation.admin} routes={adminRoutes} drawerProps={props} />
      )}

      {/* Språk */}
      <LanguageSection t={t} locale={locale} setLocale={setLocale} />

      {/* Spacer som trycker ner logout + footer */}
      <View style={{ flexGrow: 1 }} />

      {/* Logga ut separat knapp */}
      <LogoutRow
        t={t}
        logoutRoute={logoutRoute}
        navigate={(name: string) => props.navigation.navigate(name as never)}
      />

      {/* Footer / version */}
      <FooterVersion
        t={t}
        version={version}
        build={String(build ?? '')}
        onPress={() => {
          // framtida About/Release notes
        }}
      />
    </DrawerContentScrollView>
  )
}
