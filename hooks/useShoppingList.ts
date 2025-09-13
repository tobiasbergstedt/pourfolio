// hooks/useShoppingList.ts
import { auth, db } from '@/lib/firebase'
import { collection, doc, DocumentReference, getDocs, writeBatch } from 'firebase/firestore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type DraftItem = {
  id?: string
  drinkTypeId: string | null
  name: string
  quantity: number
  checked: boolean
}

export function useShoppingList() {
  const user = auth.currentUser
  const colRef = useMemo(
    () => (user ? collection(db, 'users', user.uid, 'shoppingList') : null),
    [user]
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [items, setItems] = useState<DraftItem[]>([])

  // Håller "senast sparade/lastade" snapshot
  const initialRef = useRef<DraftItem[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!colRef) {
        setItems([])
        initialRef.current = []
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const snap = await getDocs(colRef)
        if (cancelled) return
        const next: DraftItem[] = []
        snap.forEach(d => {
          const data = d.data() as any
          next.push({
            id: d.id,
            drinkTypeId: data.drinkTypeRef ? (data.drinkTypeRef as DocumentReference).id : null,
            name: data.name ?? '',
            quantity: data.quantity ?? 1,
            checked: !!data.checked,
          })
        })
        setItems(next)
        initialRef.current = next // baseline som vi kan resetta tillbaka till
      } catch (e: any) {
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [colRef])

  // ===== Lokala mutationer (som tidigare) =====
  const addFromDrinkType = useCallback((drinkTypeId: string, name: string, quantity = 1) => {
    setItems(prev => {
      const i = prev.findIndex(p => p.drinkTypeId === drinkTypeId)
      if (i >= 0) {
        const copy = [...prev]
        copy[i] = { ...copy[i], quantity: copy[i].quantity + Math.max(1, quantity) }
        return copy
      }
      return [...prev, { drinkTypeId, name, quantity: Math.max(1, quantity), checked: false }]
    })
  }, [])

  const addManualItem = useCallback((name: string, quantity = 1) => {
    const cleaned = name.trim()
    if (!cleaned) return
    setItems(prev => [
      ...prev,
      { drinkTypeId: null, name: cleaned, quantity: Math.max(1, quantity), checked: false },
    ])
  }, [])

  const incrementQuantity = useCallback((index: number, delta: number) => {
    setItems(prev => {
      const copy = [...prev]
      const cur = copy[index]
      if (!cur) return prev
      copy[index] = { ...cur, quantity: Math.max(0, (cur.quantity ?? 0) + delta) }
      return copy
    })
  }, [])

  const toggleChecked = useCallback((index: number, checked: boolean) => {
    setItems(prev => {
      const copy = [...prev]
      if (!copy[index]) return prev
      copy[index] = { ...copy[index], checked }
      return copy
    })
  }, [])

  const deleteItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearPurchased = useCallback(() => {
    setItems(prev => prev.filter(it => !it.checked))
  }, [])

  // ===== Reset vid blur/unmount: kasta osparade ändringar =====
  const resetDraft = useCallback(() => {
    setItems(initialRef.current ?? [])
  }, [])

  // ===== Save: rensa kollektionen och skriv helt ny =====
  const saveDraft = useCallback(async () => {
    if (!colRef) throw new Error('Not signed in')

    // Hämta och radera ALLT
    const snap = await getDocs(colRef)
    let batch = writeBatch(db)
    for (const d of snap.docs) batch.delete(d.ref)

    // Skriv alla nuvarande items som NYA dokument (nya id:n)
    const newArr: DraftItem[] = []
    for (const it of items) {
      const ref = doc(colRef)
      const normalized: DraftItem = { ...it, id: ref.id }
      newArr.push(normalized)
      batch.set(ref, {
        drinkTypeRef: it.drinkTypeId ? doc(db, 'drinks', it.drinkTypeId) : null,
        name: it.name,
        quantity: Math.max(0, Math.floor(it.quantity ?? 0)),
        checked: !!it.checked,
      })
    }

    await batch.commit()

    // Uppdatera baseline så nya osparade ändringar kan jämföras framöver
    initialRef.current = newArr
    setItems(newArr)
  }, [colRef, items])

  return {
    loading,
    error,
    items,
    setItems,
    addFromDrinkType,
    addManualItem,
    incrementQuantity,
    toggleChecked,
    deleteItem,
    clearPurchased,
    saveDraft,
    resetDraft, // <— ny
  }
}
