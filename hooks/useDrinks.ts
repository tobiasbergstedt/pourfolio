// home/useDrinks.ts
import { auth, db } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { DrinkDocument, DrinkRefData, DrinkTypeDocument } from '@/types/firebase'
import { Drink } from '@/types/types'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDoc, onSnapshot, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'

export function useDrinks() {
  const { t } = useStrings()
  const [drinks, setDrinks] = useState<Drink[]>([])

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined

    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (!user) return

      const q = query(collection(db, `users/${user.uid}/drinks`))

      unsubscribeSnapshot = onSnapshot(q, async snapshot => {
        const list = await Promise.all(
          snapshot.docs.map(async docSnap => {
            const data = docSnap.data() as DrinkRefData
            if (!data?.drink_type || !data?.drink_ref) return null

            const typeSnap = await getDoc(data.drink_type)
            const drinkDoc = await getDoc(data.drink_ref)

            const drinkData = drinkDoc.data() as DrinkDocument | undefined
            const typeData = typeSnap.data() as DrinkTypeDocument | undefined

            const drinkTypeKey =
              (typeData?.name.toLowerCase() as keyof typeof t.general.drink_types) || 'fallback'
            const drink_name = t.general.drink_types[drinkTypeKey]

            return {
              id: docSnap.id,
              name: drinkData?.name ?? t.general.name_missing,
              quantity: data.quantity || 0,
              type: typeData?.name ?? t.home.unknown_drink_type,
              type_name: drink_name,
              alcohol_percent: drinkData?.alcohol_percent ?? null,
              image_label: drinkData?.image_label ?? null,
              rating: data.rating ?? null,
            }
          })
        )

        const valid = list.filter(Boolean) as Drink[]
        valid.sort((a, b) => a.name.localeCompare(b.name))
        setDrinks(valid)
      })
    })

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot()
      unsubscribeAuth()
    }
  }, [])

  return drinks
}
