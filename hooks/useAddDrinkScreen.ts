// hooks/useAddDrinkScreen.ts
import { auth } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { useCurrentList } from '@/providers/ListProvider'
import { addOrUpdateListDrink, fetchDrinkTypes, fetchDrinks } from '@/services/drinks'
import type { ListDrink } from '@/types/list'
import type { DrinkType } from '@/types/types'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-native'

type Init = { initialDrinkId?: string; initialTypeId?: string }

export function useAddDrinkScreen(_init?: Init) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [allDrinks, setAllDrinks] = useState<ListDrink[]>([])
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([])
  const [selectedType, setSelectedType] = useState<DrinkType | null>(null)
  const [selectedDrink, setSelectedDrink] = useState<ListDrink | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [listQuery, setListQuery] = useState('')
  const { selectedListId } = useCurrentList()

  // När vi sätter typ/dryck programmatiskt vill vi inte att reset-effekten kör
  const suppressResetRef = useRef(false)

  const { t } = useStrings()

  // Ladda referensdata
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

  // Rensa state när skärmen blur:as (när man lämnar Add)
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedType(null)
        setSelectedDrink(null)
        setQuantity('1')
        setListQuery('')
        suppressResetRef.current = false
      }
    }, [])
  )

  // Nollställ valt dryck + sök när kategori ändras (om vi inte sätter programmatiskt)
  useEffect(() => {
    if (suppressResetRef.current) return
    setSelectedDrink(null)
    setListQuery('')
  }, [selectedType])

  // Imperativt auto-val som kan köras på fokus eller när params uppdateras
  const applyDeepLink = useCallback(
    (params: { drinkId?: string; typeId?: string }): boolean => {
      if (!drinkTypes.length || !allDrinks.length) return false

      // 1) Försök härleda typ från drinkId
      let d: ListDrink | null = null
      let t: DrinkType | null = null

      if (params.drinkId) {
        d = allDrinks.find(x => x.id === params.drinkId) ?? null
        if (d) t = drinkTypes.find(tt => tt.id === d?.type) ?? null
      }

      // 2) Eller använd bara typeId om ingen drink matchades
      if (!t && params.typeId) {
        t = drinkTypes.find(tt => tt.id === params.typeId) ?? null
      }

      if (!t) return false

      // Suppressa reset-effekten medan vi sätter båda värdena
      suppressResetRef.current = true
      setSelectedType(prev => (prev?.id === t!.id ? prev : t))
      if (d && d.type === t.id) {
        setSelectedDrink(d)
      } else {
        setSelectedDrink(null)
      }

      // Släpp suppress efter nästa macrotick så reset kan fungera normalt
      setTimeout(() => {
        suppressResetRef.current = false
      }, 0)

      return true
    },
    [allDrinks, drinkTypes]
  )

  // Listor → filtrering
  const filteredDrinks = useMemo(
    () => (selectedType ? allDrinks.filter(d => d.type === selectedType.id) : []),
    [allDrinks, selectedType]
  )

  const visibleDrinks = useMemo(() => {
    const q = listQuery.trim().toLowerCase()
    if (!q) return filteredDrinks
    return filteredDrinks.filter(d => [d.name, d.brand].some(v => v?.toLowerCase().includes(q)))
  }, [filteredDrinks, listQuery])

  // Lägg till i användarens inventarie
  const handleAdd = useCallback(async (): Promise<boolean> => {
    const user = auth.currentUser
    if (!user || !selectedDrink || !quantity || !selectedListId) return false
    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty <= 0) {
      Alert.alert(t.general.error, t.edit_drink.positive_integer)
      return false
    }
    setSaving(true)
    try {
      await addOrUpdateListDrink({
        listId: selectedListId,
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
      setSaving(false)
    }
  }, [selectedDrink, quantity, selectedType?.id, t, selectedListId])

  return {
    // state
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

    // actions
    handleAdd,
    applyDeepLink, // 👈 NY: anropa denna från Add-skärmen på fokus
  }
}
