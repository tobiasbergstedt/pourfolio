// screens/add/AddDrinkScreen.tsx
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
import { useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Platform, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AddDrinkScreen() {
  const router = useRouter()
  const { t } = useStrings()
  const insets = useSafeAreaInsets()
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
  } = useAddDrinkScreen()

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
