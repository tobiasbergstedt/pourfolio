import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import CategoryGrid from '@/components/CategoryGrid'
import IconTextInput from '@/components/IconTextInput'
import InfoCard from '@/components/InfoCard'
import LoadingIndicator from '@/components/LoadingIndicator'
import ScreenContainer from '@/components/ScreenContainer'
import AdminDrinkRow from '@/components/admin-edit/AdminDrinkRow'
import sharedStyles from '@/components/shared/styles'
import { useAdminEditList } from '@/hooks/useAdminEditList'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useStrings } from '@/providers/I18nProvider'
import { useFocusEffect } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import { Alert, Platform, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AdminEditIndexScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const list = useAdminEditList()
  const { t } = useStrings()

  const { setSelectedType, setQuery } = list

  useFocusEffect(
    useCallback(() => {
      // onFocus: gör inget
      return () => {
        // onBlur: nollställ filter
        setSelectedType(null)
        setQuery('')
      }
    }, [setSelectedType, setQuery])
  )

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert(t.general.error, t.navigation?.not_authorized)
      router.replace('/')
    }
  }, [adminLoading, isAdmin, router])

  if (adminLoading || list.loading) {
    return <LoadingIndicator message={t.general.loading} />
  }

  return (
    <ScreenContainer>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          paddingVertical: Styles.marginPaddingMain,
          paddingBottom: 24 + insets.bottom,
          gap: Styles.marginPaddingSmall,
        }}
      >
        <InfoCard label={t.admin_edit.search}>
          <IconTextInput
            icon="search"
            placeholder={t.home.search_placeholder}
            value={list.query}
            onChangeText={list.setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
        </InfoCard>

        <InfoCard label={t.add_drink.choose_category}>
          <CategoryGrid
            data={list.drinkTypes}
            selectedId={list.selectedType?.id}
            onSelect={list.setSelectedType}
            styleOverrides={{
              cell: sharedStyles.typeCell,
              cellActive: sharedStyles.typeCellActive,
              icon: sharedStyles.typeIcon,
              iconFallback: sharedStyles.typeIconFallback,
              text: sharedStyles.typeText,
            }}
          />
        </InfoCard>

        <InfoCard label={t.admin_edit.results}>
          {list.visibleDrinks.length === 0 ? (
            <Text style={{ color: Colors.gray }}>{t.general.no_results_found}</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {list.visibleDrinks.map(d => (
                <AdminDrinkRow
                  key={d.id}
                  drink={d}
                  onPress={() =>
                    router.push({ pathname: '/admin-edit/[id]', params: { id: String(d.id) } })
                  }
                />
              ))}
            </View>
          )}
        </InfoCard>
      </ScrollView>
    </ScreenContainer>
  )
}
