import Colors from '@/assets/colors'
import DrawerRow from '@/components/navigation/DrawerRow'
import styles from '@/components/navigation/styles'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  t: any
  locale: 'sv' | 'en' | string
  setLocale: (l: 'sv' | 'en') => void
}

export default function LanguageSection({ t, locale, setLocale }: Props) {
  return (
    <View style={styles.appDrawerContentSection}>
      <View style={styles.appDrawerContentSectionTitleWrapper}>
        <Text style={styles.appDrawerContentSectionTitle}>{t.navigation.language}</Text>
      </View>

      <DrawerRow
        focused={locale === 'sv'}
        showActiveBorder={false}
        icon={({ size }) => (
          <MaterialCommunityIcons
            name={locale === 'sv' ? 'checkbox-marked-circle-outline' : 'circle-outline'}
            size={size}
            color={locale === 'sv' ? Colors.primary : Colors.gray}
          />
        )}
        label={
          <Text
            style={{
              color: locale === 'sv' ? Colors.darkGray : Colors.gray,
              fontSize: 15,
              fontWeight: locale === 'sv' ? '700' : '600',
            }}
          >
            {t.general.swedish}
          </Text>
        }
        onPress={() => setLocale('sv' as 'sv')}
      />

      <DrawerRow
        focused={locale === 'en'}
        showActiveBorder={false}
        icon={({ size }) => (
          <MaterialCommunityIcons
            name={locale === 'en' ? 'checkbox-marked-circle-outline' : 'circle-outline'}
            size={size}
            color={locale === 'en' ? Colors.primary : Colors.gray}
          />
        )}
        label={
          <Text
            style={{
              color: locale === 'en' ? Colors.darkGray : Colors.gray,
              fontSize: 15,
              fontWeight: locale === 'en' ? '700' : '600',
            }}
          >
            {t.general.english}
          </Text>
        }
        onPress={() => setLocale('en' as 'en')}
      />
    </View>
  )
}
