import { db } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { collection, getDocs } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'

export type AdminCategory = {
  id: string // slug / doc id
  displayName?: string
  icon?: string
}

export function useAdminCategoryList() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const { t } = useStrings()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const snap = await getDocs(collection(db, 'drinkTypes'))
        if (cancelled) return
        const types = snap.docs
          .map(d => {
            const data = d.data() as any
            return {
              id: d.id,
              displayName: data?.name ?? undefined,
              icon: data?.icon ?? undefined,
            } as AdminCategory
          })
          .filter(Boolean)
        setCategories(types)
      } catch (e) {
        console.error('AdminCategoryList: fetch failed', e)
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

  return { loading, categories }
}
