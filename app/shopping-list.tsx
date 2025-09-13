// app/shopping-list.tsx
import Styles from '@/assets/styles'
import MasterButton from '@/components/MasterButton'
import ScreenContainer from '@/components/ScreenContainer'
import DrinkPicker from '@/components/shopping-list/DrinkPicker'
import ShoppingItemRow from '@/components/shopping-list/ShoppingItemRow'
import styles from '@/components/shopping-list/styles'
import type { DrinkType } from '@/hooks/useDrinkTypes'
import { useShoppingList } from '@/hooks/useShoppingList' // se till att importen pekar rätt
import { useStrings } from '@/providers/I18nProvider'
import { useFocusEffect } from '@react-navigation/native'
import { Stack, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Platform, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ShoppingListScreen() {
  const {
    items,
    loading,
    error,
    addFromDrinkType,
    incrementQuantity,
    toggleChecked,
    deleteItem,
    clearPurchased,
    saveDraft,
    resetDraft, // <— från hooken
  } = useShoppingList()

  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState<DrinkType | null>(null)
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const savingRef = useRef<boolean>(null)
  const [focusKey, setFocusKey] = useState(0)

  const handleAddFromPicker = (d: DrinkType) => {
    addFromDrinkType(d.id, d.name, 1)
  }

  const { t } = useStrings()

  const handleSave = async () => {
    if (saving || cancelling) return
    try {
      setSaving(true)
      await saveDraft()
      requestAnimationFrame(() => {
        if (router.canGoBack()) router.back()
        else router.replace('/') // fallback om ingen back-stack
      })
    } catch (e: any) {
      Alert.alert(t.general.unable_to_save, e?.message ?? t.general.unknown_error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (cancelling || saving) return
    setCancelling(true)
    requestAnimationFrame(() => router.back()) // skärmen unmountas → state försvinner ändå
  }

  useEffect(() => {
    savingRef.current = saving
  }, [saving])

  useFocusEffect(
    useCallback(() => {
      // vänta till nästa frame så ScrollView finns i DOM
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false })
      })
      setFocusKey(k => k + 1)
      setCancelling(false)

      // cleanup vid blur – dina befintliga saker kan ligga här (t.ex. resetDraft)
      return () => {
        // ex: resetDraft() om du vill kasta osparat på blur
        if (!savingRef.current) {
          setTimeout(() => resetDraft(), 0) // nästa tick → ingen “flash”
        }
      }
    }, [resetDraft])
  )

  return (
    <ScreenContainer>
      {/* (Val 1) Unmounta skärmen på blur så state alltid försvinner */}
      <Stack.Screen options={{ title: t.shopping_list.title }} />

      {loading ? (
        <View style={styles.shoppingListOuterContainer}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={{
            paddingTop: Styles.marginPaddingLarge,
            paddingBottom: Styles.marginPaddingMain,
          }}
        >
          <DrinkPicker
            selectedId={selected?.id ?? null}
            onSelect={d => setSelected(prev => (prev?.id === d.id ? null : d))}
            onAdd={handleAddFromPicker}
          />

          <MasterButton
            title={t.shopping_list.remove_marked}
            onPress={clearPurchased}
            variant="secondary"
            size="small"
            style={styles.removeMarkedButton}
          />

          {/* Lista över lokala draft-items */}
          <View style={styles.shoppingListContainer}>
            {items.length === 0 ? (
              <View style={styles.shoppingListEmptyPlaceholder}>
                <Text>{t.shopping_list.empty_placeholder}</Text>
              </View>
            ) : (
              items.map((item, index) => (
                <View key={item.id ?? `draft-${index}`}>
                  <ShoppingItemRow
                    item={item}
                    index={index}
                    onToggle={(i, checked) => toggleChecked(i, checked)}
                    onInc={(i, d) => incrementQuantity(i, d)}
                    onDelete={i => deleteItem(i)}
                  />
                </View>
              ))
            )}
          </View>

          <View style={styles.shoppingListButtonsContainer}>
            <MasterButton
              title={saving ? t.general.saving : t.shopping_list.save}
              onPress={handleSave}
              disabled={saving}
              variant="primary"
              style={styles.shoppingListButton}
            />
            <MasterButton
              title={cancelling ? t.general.cancelling : t.edit_drink.cancel}
              onPress={handleCancel}
              disabled={cancelling || saving}
              variant="secondary"
              style={styles.shoppingListButton}
            />
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  )
}
