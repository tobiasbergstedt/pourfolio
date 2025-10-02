import { FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Platform, ScrollView, Text, View } from 'react-native'

import IconTextInput from '@/components/IconTextInput'
import ScreenContainer from '@/components/ScreenContainer'
import DrinkItem from '@/components/home/DrinkItem'
import EmptyMessage from '@/components/home/EmptyMessage'
import StatsOverview from '@/components/home/Stats'
import { useDrinks } from '@/hooks/useDrinks'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useUserProfile } from '@/hooks/useUserProfile'

import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import DrinkCategories from '@/components/DrinkCategories'
import MasterButton from '@/components/MasterButton'
import styles from '@/components/home/styles'
import { useStrings } from '@/providers/I18nProvider'

export default function HomeScreen() {
  const router = useRouter()
  const { isAdmin } = useIsAdmin()
  const { t } = useStrings()
  const drinks = useDrinks()
  const firstName = useUserProfile()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const filteredDrinks = drinks.filter(drink => {
    const matchesQuery = drink.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(drink.type.toLowerCase())
    return matchesQuery && matchesCategory
  })

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.screen}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}
      >
        <Text style={styles.welcomeText}>
          {t.home.welcome.replace('{name}', firstName || 'user')}
        </Text>

        <View style={styles.buttonRow}>
          <MasterButton
            title={t.home.add_drink}
            onPress={() => router.push('/add')}
            variant="primary"
            icon={
              <FontAwesome5 name="plus-circle" size={Styles.iconSizeMain} color={Colors.white} />
            }
            style={{ flex: 1, minWidth: 0 }}
          />
          <MasterButton
            title={t.home.scan_drink}
            onPress={() => router.push('/scan')}
            variant="secondary"
            icon={<FontAwesome5 name="camera" size={Styles.iconSizeMain} color={Colors.primary} />}
            style={{ flex: 1, minWidth: 0 }}
          />
        </View>

        <StatsOverview drinks={drinks} />

        <DrinkCategories onSelect={setSelectedCategories} />

        {drinks.length === 0 && searchQuery.trim() === '' ? (
          <EmptyMessage text={t.home.no_drinks_added} />
        ) : (
          <View style={styles.listWrapper}>
            <IconTextInput
              icon="search"
              placeholder={t.home.search_placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {filteredDrinks.length === 0 ? (
              <EmptyMessage text={t.general.no_results_found} />
            ) : (
              filteredDrinks.map(drink => (
                <DrinkItem
                  key={drink.id}
                  item={drink}
                  onPress={() => router.push({ pathname: '/edit', params: { id: drink.id } })}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  )
}
