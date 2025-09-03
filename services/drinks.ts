// services/drinks.ts
import { db } from '@/lib/firebase'
import type { ListDrink } from '@/types/list'
import type { DrinkType } from '@/types/types'
import { flattenDrinkDoc } from '@/utils/drinks'
import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'

export async function fetchDrinkTypes(): Promise<DrinkType[]> {
  const snap = await getDocs(collection(db, 'drinkTypes'))
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })).filter(Boolean) as DrinkType[]
}

export async function fetchDrinks(): Promise<ListDrink[]> {
  const snap = await getDocs(collection(db, 'drinks'))
  const items = snap.docs.map(d => flattenDrinkDoc(d.data(), d.id)).filter(Boolean) as ListDrink[]
  return items
}

/** Lägg till eller bumpa kvantitet i användarens lista. */
export async function addOrUpdateUserDrink(opts: {
  userId: string
  drinkId: string
  qty: number
  selectedTypeId?: string
}) {
  const { userId, drinkId, qty, selectedTypeId } = opts
  const colRef = collection(db, `users/${userId}/drinks`)

  // Finns redan? (matcha på drink_ref)
  const q = query(colRef, where('drink_ref', '==', doc(db, 'drinks', drinkId)))
  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0]
    const existingData = existingDoc.data() as any
    const newQuantity = (existingData.quantity || 0) + qty
    await updateDoc(existingDoc.ref, { quantity: newQuantity })
  } else {
    await addDoc(colRef, {
      quantity: qty,
      drink_ref: doc(db, 'drinks', drinkId),
      created_at: new Date(),
      drink_type: selectedTypeId
        ? (doc(db, 'drinkTypes', selectedTypeId) as DocumentReference)
        : null,
    })
  }
}
