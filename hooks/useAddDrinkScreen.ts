// hooks/useAddDrinkScreen.ts
import { auth } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { addOrUpdateUserDrink, fetchDrinkTypes, fetchDrinks } from '@/services/drinks'
import type { ListDrink } from '@/types/list'
import type { DrinkType } from '@/types/types'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'

export function useAddDrinkScreen() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false) // 👈 NY
  const [allDrinks, setAllDrinks] = useState<ListDrink[]>([])
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([])
  const [selectedType, setSelectedType] = useState<DrinkType | null>(null)
  const [selectedDrink, setSelectedDrink] = useState<ListDrink | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [listQuery, setListQuery] = useState('')
  const { t } = useStrings()

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedType(null)
        setSelectedDrink(null)
        setQuantity('1')
        setListQuery('')
      }
    }, [])
  )

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const [types, drinks] = await Promise.all([fetchDrinkTypes(), fetchDrinks()])
        setDrinkTypes(types)
        setAllDrinks(drinks)
      } catch (e) {
        console.error(t.add_drink.add_error, e)
        Alert.alert(t.general.error, t.add_drink.add_error)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  useEffect(() => {
    setSelectedDrink(null)
    setListQuery('')
  }, [selectedType])

  const filteredDrinks = useMemo(
    () => (selectedType ? allDrinks.filter(d => d.type === selectedType.id) : []),
    [allDrinks, selectedType]
  )

  const visibleDrinks = useMemo(() => {
    const q = listQuery.trim().toLowerCase()
    if (!q) return filteredDrinks
    return filteredDrinks.filter(d => [d.name, d.brand].some(v => v?.toLowerCase().includes(q)))
  }, [filteredDrinks, listQuery])

  const handleAdd = async (): Promise<boolean> => {
    // 👈 returnera success
    const user = auth.currentUser
    if (!user || !selectedDrink || !quantity) return false

    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty <= 0) {
      Alert.alert(t.general.error, t.edit_drink.positive_integer)
      return false
    }

    setSaving(true) // 👈 börja visa loader
    try {
      await addOrUpdateUserDrink({
        userId: user.uid,
        drinkId: selectedDrink.id,
        qty,
        selectedTypeId: selectedType?.id,
      })
      return true
    } catch (e) {
      console.error(t.add_drink.add_error, e)
      Alert.alert(t.general.error, t.add_drink.add_error)
      return false
    } finally {
      setSaving(false) // 👈 sluta visa loader
    }
  }

  return {
    loading,
    saving, // 👈 exportera
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
  }
}
