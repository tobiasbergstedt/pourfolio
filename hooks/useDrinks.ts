// hooks/useDrinks.ts
import { db } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import type { Drink } from '@/types/types'
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

/**
 * Hämtar dryckerna för en vald lista (lists/{listId}/drinks/*) och
 * joinar mot global katalog (drinks/{drinkId}) + drinkTypes.
 * Returnerar samma struktur som tidigare användes på startsidan.
 *
 * 🔁 Soft delete: filtrerar bort rader där quantity <= 0
 */
export function useDrinks(listId?: string | null) {
  const { t } = useStrings()
  const [drinks, setDrinks] = useState<Drink[]>([])

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined

    // Ingen vald lista → töm
    if (!listId) {
      setDrinks([])
      return
    }

    const col = collection(db, 'lists', listId, 'drinks')

    unsubscribe = onSnapshot(
      col,
      async snap => {
        try {
          const rows = await Promise.all(
            snap.docs.map(async d => {
              try {
                const listData = d.data() as any
                const drinkId = d.id

                // Soft delete-filter: hoppa över poster med quantity <= 0
                const qty = Number(listData?.quantity ?? 0)
                if (!Number.isFinite(qty) || qty <= 0) return null

                // Global dryck
                const drinkSnap = await getDoc(doc(db, 'drinks', drinkId))
                if (!drinkSnap.exists()) return null
                const g = drinkSnap.data() as any

                // Typ-id: helst från listpostens "type", annars från global doc referensen
                const typeId: string | undefined =
                  (typeof listData?.type === 'string' && listData.type) || g?.drink_type?.id

                // Typnamn
                let typeName: string | undefined
                if (typeId) {
                  try {
                    const typeSnap = await getDoc(doc(db, 'drinkTypes', typeId))
                    if (typeSnap.exists()) {
                      typeName = (typeSnap.data() as any)?.name
                    }
                  } catch {
                    /* noop – behåll undefined */
                  }
                }

                // Lokaliserad typlabel
                const key = (typeName ?? '')
                  .toString()
                  .toLowerCase() as keyof typeof t.general.drink_types
                const localizedType =
                  t.general.drink_types[key] ?? typeName ?? t.home.unknown_drink_type

                const name = (g?.name as string) ?? t.general.name_missing

                const row: Drink = {
                  id: drinkId,
                  name,
                  quantity: qty,
                  type: (typeName ?? '').toString(), // används för filtrering på startsidan
                  type_name: localizedType, // visningsnamn
                  alcohol_percent: g?.alcohol_percent ?? null,
                  image_label: g?.image_label ?? null,
                  rating: g?.rating ?? null,
                  brand: g?.brand ?? null,
                  country: g?.country ?? null,
                  volume: g?.volume ?? null,
                  description: g?.description ?? null,
                  pairing_suggestions: g?.pairing_suggestions ?? null,
                }

                return row
              } catch {
                return null
              }
            })
          )

          if (cancelled) return

          const valid = rows.filter(Boolean) as Drink[]
          valid.sort((a, b) => a.name.localeCompare(b.name))
          setDrinks(valid)
        } catch (e) {
          if (cancelled) return
          console.warn('[useDrinks] build rows failed:', e)
          setDrinks([])
        }
      },
      err => {
        // Viktigt: när en lista raderas och din membership försvinner
        // kan snapshotten få "permission denied". Fånga det och
        // töm listan istället för att krascha UI.
        if (cancelled) return
        console.warn('[useDrinks] snapshot error for', listId, err)
        setDrinks([])
      }
    )

    return () => {
      cancelled = true
      try {
        unsubscribe?.()
      } catch {
        /* noop */
      }
    }
    // Beroenden: använd konkreta strängar för att undvika onödig re-subscribe
  }, [listId, t.general.drink_types, t.home.unknown_drink_type, t.general.name_missing])

  return drinks
}
