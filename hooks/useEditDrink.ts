import useFixCountry from '@/hooks/useFixCountry'
import { auth, db } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { Drink, SaveExtras } from '@/types/types'
import { useFocusEffect, useRouter } from 'expo-router'
import {
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  runTransaction,
  updateDoc,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'

export function useEditDrink(id?: string) {
  const { t } = useStrings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [drink, setDrink] = useState<Drink | null>(null)
  const [drinkRef, setDrinkRef] = useState<DocumentReference | null>(null)
  const [quantity, setQuantity] = useState('')
  const [userRating, setUserRating] = useState<number | null>(null)
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [ratingCount, setRatingCount] = useState<number | null>(null)
  const [alcoholPercent, setAlcoholPercent] = useState<string>('—')
  const [drinkTypeName, setDrinkTypeName] = useState<string>('—')
  const [userNotes, setUserNotes] = useState<string | null>(null)

  const router = useRouter()
  const fixCountry = useFixCountry()

  const resetState = useCallback(() => {
    setDrink(null)
    setDrinkRef(null)
    setQuantity('')
    setUserRating(null)
    setAvgRating(null)
    setRatingCount(null)
    setAlcoholPercent('—')
    setDrinkTypeName('—')
    setUserNotes(null)
    setLoading(true)
    setSaving(false)
  }, [])

  const fetchData = useCallback(async () => {
    const user = auth.currentUser
    if (!user || !id) return

    setLoading(true)
    try {
      const userRef = doc(db, `users/${user.uid}/drinks/${id}`)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        Alert.alert(t.edit_drink.no_exist)
        router.back()
        return
      }

      const userData = userSnap.data()
      setQuantity(String(userData.quantity || ''))
      setUserRating(userData.rating ?? null)

      const rawNotes = typeof userData.user_notes === 'string' ? userData.user_notes : ''
      setUserNotes(rawNotes.trim() ? rawNotes : null)

      const ref = userData.drink_ref as DocumentReference | undefined
      if (ref?.id) {
        setDrinkRef(ref)
        const drinkSnap = await getDoc(ref)
        const drinkData = drinkSnap.data() as Drink | undefined
        if (drinkSnap.exists() && drinkData) {
          setDrink(drinkData)

          const r: any = drinkData.rating ?? {}
          setAvgRating(r.average_rating ?? null)
          setRatingCount(r.number_of_ratings ?? r.amount_of_ratings ?? null)

          if (drinkData.alcohol_percent != null) {
            const value = Number(drinkData.alcohol_percent)
            setAlcoholPercent(value > 1.5 ? `${value}% ${t.general.vol}.` : t.general.non_alcoholic)
          } else {
            setAlcoholPercent('—')
          }

          if (drinkData.drink_type && typeof (drinkData.drink_type as any).id === 'string') {
            try {
              const typeSnap = await getDoc(drinkData.drink_type as unknown as DocumentReference)
              const typeData = typeSnap.data() as { name?: string } | undefined
              setDrinkTypeName(typeData?.name ?? '—')
            } catch {
              setDrinkTypeName('—')
            }
          } else {
            setDrinkTypeName('—')
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }, [id, router])

  // 🔁 Kör fetch när skärmen får fokus. Nollställ allt på blur.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        if (!cancelled) await fetchData()
      })()
      return () => {
        cancelled = true
        resetState()
      }
    }, [fetchData, resetState])
  )

  useEffect(() => {
    if (drink?.alcohol_percent != null) {
      const value = Number(drink.alcohol_percent)
      setAlcoholPercent(value > 1.5 ? `${value}% ${t.general.vol}.` : t.general.non_alcoholic)
    } else {
      setAlcoholPercent('—')
    }
  }, [drink?.alcohol_percent, t])

  const handleSave = async (extras?: SaveExtras) => {
    const user = auth.currentUser
    if (!user || !id) return

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty < 0) {
      Alert.alert(t.edit_drink.positive_integer)
      return
    }

    try {
      setSaving(true)
      const payload: Record<string, any> = { quantity: qty }

      // Skicka bara med user_notes om det uttryckligen skickas in
      if (extras && 'user_notes' in extras) {
        payload.user_notes = extras.user_notes // kan vara string eller null (raderar)
      }

      await updateDoc(doc(db, `users/${user.uid}/drinks/${id}`), payload)
      router.back()
    } catch (error) {
      console.error(t.edit_drink.update_error, error)
      Alert.alert(t.edit_drink.unable_to_save)
    } finally {
      setSaving(false)
    }
  }

  const updateUserRating = async (newRating: number) => {
    const user = auth.currentUser
    if (!user || !id || !drinkRef) return

    try {
      let nextAvg = avgRating ?? 0
      let nextCount = ratingCount ?? 0

      await runTransaction(db, async tx => {
        const userDocRef = doc(db, `users/${user.uid}/drinks/${id}`)
        const userSnap = await tx.get(userDocRef)
        const prevUserRating: number | null = userSnap.data()?.rating ?? null

        const drinkSnap = await tx.get(drinkRef)
        const data = drinkSnap.data() ?? {}
        const r: any = data.rating ?? {}
        const currentAvg: number = r.average_rating ?? 0
        const currentCount: number = (r.number_of_ratings ?? r.amount_of_ratings ?? 0) as number

        let c = currentCount
        let a = currentAvg

        if (prevUserRating == null) {
          c = currentCount + 1
          a = (currentAvg * currentCount + newRating) / c
        } else {
          c = currentCount || 1
          a = (currentAvg * currentCount - prevUserRating + newRating) / c
        }

        tx.update(userDocRef, { rating: newRating })
        tx.update(drinkRef, {
          'rating.average_rating': a,
          'rating.number_of_ratings': c,
          'rating.amount_of_ratings': c,
        })

        nextAvg = a
        nextCount = c
      })

      setUserRating(newRating)
      setAvgRating(nextAvg)
      setRatingCount(nextCount)
    } catch (error) {
      console.error(t.edit_drink.unable_to_save_rating, error)
      Alert.alert(t.edit_drink.save_rating_error)
    }
  }

  const handleDelete = async () => {
    const user = auth.currentUser
    if (!user || !id) return

    Alert.alert(t.edit_drink.delete, t.edit_drink.delete_confirmation, [
      { text: t.edit_drink.cancel, style: 'cancel' },
      {
        text: t.edit_drink.delete_confirmation_button,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, `users/${user.uid}/drinks/${id}`))
            router.replace('/')
          } catch (error) {
            console.error(t.edit_drink.error_deleting, error)
            Alert.alert(t.edit_drink.unable_to_delete)
          }
        },
      },
    ])
  }

  const countryName = fixCountry(drink?.country || '')

  return {
    loading,
    saving,
    drink,
    quantity,
    setQuantity,
    userRating,
    avgRating,
    ratingCount,
    handleSave, // <-- tar nu emot extras?: { user_notes?: string | null }
    updateUserRating,
    handleDelete,
    countryName,
    alcoholPercent,
    drinkTypeName,
    userNotes, // initialt värde från användarens dokument
    setUserNotes, // om du vill binda input direkt till hooken
  }
}
