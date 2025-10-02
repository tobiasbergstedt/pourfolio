// app/add.tsx
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import CategoryGrid from '@/components/CategoryGrid'
import InfoCard from '@/components/InfoCard'
import LoadingIndicator from '@/components/LoadingIndicator'
import MasterButton from '@/components/MasterButton'
import ScreenContainer from '@/components/ScreenContainer'
import DrinkList from '@/components/add/DrinkList'
import AmountCard from '@/components/edit/AmountCard'
import sharedStyles from '@/components/shared/styles'
import { useAddDrinkScreen } from '@/hooks/useAddDrinkScreen'
import { useStrings } from '@/providers/I18nProvider'
import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback } from 'react'
import { ActivityIndicator, Platform, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AddDrinkScreen() {
  const router = useRouter()
  const { t } = useStrings()
  const insets = useSafeAreaInsets()
  const isFocused = useIsFocused()

  const { drinkId, typeId } = useLocalSearchParams<{
    drinkId?: string | string[]
    typeId?: string | string[]
    fromScan?: string
  }>()

  const toStr = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)

  const {
    loading,
    saving,
    drinkTypes,
    selectedType,
    setSelectedType,
    selectedDrink,
    setSelectedDrink,
    quantity,
    setQuantity,
    listQuery,
    setListQuery,
    visibleDrinks,
    handleAdd,
    applyDeepLink, // 👈
  } = useAddDrinkScreen()

  // 🔁 När skärmen fokuseras: applicera deep link (även om params är samma som förra gången)
  useFocusEffect(
    useCallback(() => {
      const did = toStr(drinkId)
      const tid = toStr(typeId)

      // Vänta tills data är laddad (loading=false) – görs via en liten poll
      let cancelled = false
      const tryApply = () => {
        if (cancelled) return
        if (!loading) {
          applyDeepLink({
            drinkId: typeof did === 'string' ? did : undefined,
            typeId: typeof tid === 'string' ? tid : undefined,
          })
        } else {
          // prova igen nästa frame tills listorna är laddade
          requestAnimationFrame(tryApply)
        }
      }
      tryApply()

      return () => {
        cancelled = true
      }
    }, [drinkId, typeId, loading, applyDeepLink])
  )

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenContainer>
    )
  }

  if (saving) {
    return (
      <ScreenContainer>
        <LoadingIndicator message={t.general.saving} />
      </ScreenContainer>
    )
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
        <InfoCard label={t.add_drink.choose_category}>
          <CategoryGrid
            data={drinkTypes}
            selectedId={selectedType?.id}
            onSelect={setSelectedType}
            styleOverrides={{
              cell: sharedStyles.typeCell,
              cellActive: sharedStyles.typeCellActive,
              icon: sharedStyles.typeIcon,
              iconFallback: sharedStyles.typeIconFallback,
              text: sharedStyles.typeText,
            }}
          />
        </InfoCard>

        {selectedType && (
          <DrinkList
            label={t.add_drink.choose_drink}
            drinks={visibleDrinks}
            selectedId={selectedDrink?.id}
            onSelect={setSelectedDrink}
            search={listQuery}
            onSearch={setListQuery}
            emptyText={t.home.no_results_found}
          />
        )}

        {selectedDrink && (
          <AmountCard
            label={t.add_drink.enter_quantity}
            value={quantity}
            onChange={setQuantity}
            min={1}
            step={1}
          />
        )}

        <MasterButton
          title={t.add_drink.add_button}
          onPress={async () => {
            const ok = await handleAdd()
            if (!ok) return
            if (router.canGoBack()) router.back()
            else router.replace('/')
          }}
          variant="primary"
          disabled={!selectedDrink || !quantity || saving}
        />
      </ScrollView>
    </ScreenContainer>
  )
}
