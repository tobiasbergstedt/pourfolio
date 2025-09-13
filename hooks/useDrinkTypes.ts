import { db } from '@/lib/firebase'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'

export type DrinkType = {
  id: string
  name: string
  category?: string
  image_label?: string | null // ← lagrar path ELLER url, vi rör den inte här
}

export function useDrinkTypes() {
  const [types, setTypes] = useState<DrinkType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const colRef = useMemo(() => collection(db, 'drinks'), [])

  useEffect(() => {
    setLoading(true)
    const q = query(colRef, orderBy('name'))
    const unsub = onSnapshot(
      q,
      snap => {
        const next: DrinkType[] = []
        snap.forEach(d => {
          const data = d.data() as any
          next.push({
            id: d.id,
            name: data.name ?? '',
            category: data.category,
            image_label: data.image_label ?? null, // ← lämna som är (path/url)
          })
        })
        setTypes(next)
        setLoading(false)
      },
      e => {
        setError(e)
        setLoading(false)
      }
    )
    return unsub
  }, [colRef])

  return { types, loading, error }
}
