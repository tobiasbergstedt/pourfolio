import { db } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import type { DrinkType } from '@/types/types'
import { makeI18nTranslators } from '@/utils/i18n'
import { collection, DocumentReference, getDocs } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'

export type AdminListDrink = {
  id: string
  name: string
  brand?: string
  image_label?: string
  typeId: string
  typeLabel: string
}

export function useAdminEditList() {
  const { t } = useStrings()
  const { translateDrinkType } = useMemo(() => makeI18nTranslators(t), [t])
  const [loading, setLoading] = useState(true)
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([])
  const [allDrinks, setAllDrinks] = useState<AdminListDrink[]>([])

  const [selectedType, setSelectedType] = useState<DrinkType | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const [typeSnap, drinkSnap] = await Promise.all([
          getDocs(collection(db, 'drinkTypes')),
          getDocs(collection(db, 'drinks')),
        ])

        if (cancelled) return

        const types = typeSnap.docs
          .map(d => ({ id: d.id, ...(d.data() as any) }))
          .filter(Boolean) as DrinkType[]
        setDrinkTypes(types)

        const drinks = drinkSnap.docs
          .map(ds => {
            const data = ds.data() as any
            if (!data?.drink_type || !data?.name) return null
            const ref = data.drink_type as DocumentReference
            const typeId = ref.id
            const rawTypeName = (types.find(t => t.id === typeId) as any)?.name ?? typeId
            return {
              id: ds.id,
              name: String(data.name),
              brand: data.brand ?? undefined,
              image_label: data.image_label ?? undefined,
              typeId,
              typeLabel: translateDrinkType(rawTypeName, { prettifyFallback: true }),
            } as AdminListDrink
          })
          .filter(Boolean) as AdminListDrink[]

        setAllDrinks(drinks)
      } catch (e) {
        console.error(t.admin_edit.admin_edit_list_fail, e)
        Alert.alert(t.general.error, t.general.something_went_wrong)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const visibleDrinks = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = selectedType ? allDrinks.filter(d => d.typeId === selectedType.id) : allDrinks
    if (!q) return base
    return base.filter(d => [d.name, d.brand, d.typeLabel].some(v => v?.toLowerCase().includes(q)))
  }, [allDrinks, selectedType, query])

  return {
    loading,
    drinkTypes,
    visibleDrinks,
    selectedType,
    setSelectedType,
    query,
    setQuery,
  }
}
