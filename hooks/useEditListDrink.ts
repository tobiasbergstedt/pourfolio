// hooks/useEditListDrink.ts
import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  getDocFromServer,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Property = { name: string; value: number }
type Shop = { name: string; price: number } // arrayen vi exponerar till DetailField ska ha numeriska priser

type UseEditListDrink = {
  loading: boolean
  saving: boolean
  notFound: boolean
  canSave: boolean
  listResolved: boolean
  verifiedServerOnce: boolean

  name: string
  typeName: string
  imageLabel: string | null
  alcoholPercent: number | null
  volume: number | null
  country: string | null
  properties: Property[]
  description: string | null
  pairingSuggestions: string | null

  // 👇 BÅDE uppdelad lista & en enkel visningssträng (bakåtkompatibel)
  whereToFind: string | null
  whereToFindList: Shop[]

  quantity: string
  setQuantity: (v: string) => void
  userNotes: string
  setUserNotes: (v: string) => void

  save: (onDone?: () => void) => Promise<void>
  remove: (onDone?: () => void) => Promise<void>

  avgRating: number | null
  ratingCount: number | null
}

export function useEditListDrink(drinkId?: string, listId?: string): UseEditListDrink {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [listResolved, setListResolved] = useState(false)
  const [verifiedServerOnce, setVerifiedServerOnce] = useState(false)

  // Global drink
  const [name, setName] = useState('')
  const [typeName, setTypeName] = useState('')
  const [imageLabel, setImageLabel] = useState<string | null>(null)
  const [alcoholPercent, setAlcoholPercent] = useState<number | null>(null)
  const [volume, setVolume] = useState<number | null>(null)
  const [country, setCountry] = useState<string | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [description, setDescription] = useState<string | null>(null)
  const [pairingSuggestions, setPairingSuggestions] = useState<string | null>(null)

  const [whereToFind, setWhereToFind] = useState<string | null>(null)
  const [whereToFindList, setWhereToFindList] = useState<Shop[]>([])

  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [ratingCount, setRatingCount] = useState<number | null>(null)

  // List row
  const [quantity, setQuantity] = useState('0')
  const [userNotes, setUserNotes] = useState('')

  const recheckInFlight = useRef(false)

  // --- Global dryck ---
  useEffect(() => {
    setLoading(true)
    setNotFound(false)

    let cancelled = false
    ;(async () => {
      if (!drinkId) {
        if (!cancelled) {
          setNotFound(true)
          setLoading(false)
        }
        return
      }
      try {
        const gref = doc(db, 'drinks', drinkId)
        const gsnap = await getDoc(gref)
        if (!gsnap.exists()) {
          if (!cancelled) {
            setNotFound(true)
            setLoading(false)
          }
          return
        }
        const g = gsnap.data() as any
        if (cancelled) return

        setName(String(g?.name ?? ''))
        setImageLabel((g?.image_label as string | undefined) ?? null)
        setAlcoholPercent(typeof g?.alcohol_percent === 'number' ? g.alcohol_percent : null)
        setVolume(typeof g?.volume === 'number' ? g.volume : null)
        setCountry(typeof g?.country === 'string' && g.country ? g.country : null)

        const props = Array.isArray(g?.properties) ? g.properties : []
        const cleanProps: Property[] = props
          .map((p: any) => ({ name: String(p?.name ?? ''), value: Number(p?.value) }))
          .filter((p: Property) => p.name && Number.isFinite(p.value))
        setProperties(cleanProps)

        setDescription(typeof g?.description === 'string' ? g.description : null)
        setPairingSuggestions(
          typeof g?.pairing_suggestions === 'string' ? g.pairing_suggestions : null
        )

        // where_to_find: [{name, price}]
        const shopsRaw = Array.isArray(g?.where_to_find) ? g.where_to_find : []
        const parsed: Shop[] = shopsRaw
          .map((s: any) => ({
            name: String(s?.name ?? '').trim(),
            price: Number(s?.price),
          }))
          .filter((s: Shop) => s.name && Number.isFinite(s.price))
        setWhereToFindList(parsed)

        // enkel fallback-sträng (utan pris) till ev. äldre UI
        const shopNames = shopsRaw.map((s: any) => String(s?.name ?? '').trim()).filter(Boolean)
        setWhereToFind(shopNames.length ? shopNames.join(' · ') : null)

        let resolvedTypeName = ''
        const typeRef = g?.drink_type
        if (typeRef?.id) {
          try {
            const tsnap = await getDoc(typeRef)
            resolvedTypeName = (tsnap.data() as any)?.name ?? ''
          } catch {
            resolvedTypeName = ''
          }
        }
        setTypeName(resolvedTypeName)

        const r: any = g?.rating ?? {}
        setAvgRating(typeof r?.average_rating === 'number' ? r.average_rating : null)
        const count =
          typeof r?.number_of_ratings === 'number'
            ? r.number_of_ratings
            : typeof r?.amount_of_ratings === 'number'
              ? r.amount_of_ratings
              : null
        setRatingCount(typeof count === 'number' ? count : null)
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [drinkId])

  // --- List-raden: preflight från servern → sedan subscribe ---
  useEffect(() => {
    setListResolved(false)
    setVerifiedServerOnce(false)
    setNotFound(false)
    recheckInFlight.current = false

    if (!drinkId || !listId) return

    const ref = doc(db, 'lists', listId, 'drinks', drinkId)
    let unsub: undefined | (() => void) = undefined
    let cancelled = false

    ;(async () => {
      try {
        const ss = await getDocFromServer(ref)
        if (cancelled) return

        setVerifiedServerOnce(true)
        setListResolved(true)

        if (!ss.exists()) {
          setNotFound(true)
          return
        }

        const data = ss.data() as any
        const q = Number(data?.quantity ?? 0)
        setQuantity(Number.isFinite(q) ? String(q) : '0')
        setUserNotes(typeof data?.user_notes === 'string' ? data.user_notes : '')
        setNotFound(false)

        unsub = onSnapshot(
          ref,
          snap => {
            if (!snap.exists()) {
              setNotFound(true)
              return
            }
            const d = snap.data() as any
            const q2 = Number(d?.quantity ?? 0)
            setQuantity(Number.isFinite(q2) ? String(q2) : '0')
            setUserNotes(typeof d?.user_notes === 'string' ? d.user_notes : '')
          },
          () => {
            setNotFound(true)
          }
        )
      } catch {
        if (!cancelled) {
          setVerifiedServerOnce(true)
          setListResolved(true)
          setNotFound(true)
        }
      }
    })()

    return () => {
      cancelled = true
      try {
        unsub?.()
      } catch {}
    }
  }, [drinkId, listId])

  const canSave = useMemo(() => {
    if (!drinkId || !listId) return false
    const n = parseInt(String(quantity), 10)
    return Number.isFinite(n) && n >= 0
  }, [drinkId, listId, quantity])

  const save = useCallback(
    async (onDone?: () => void) => {
      if (!drinkId || !listId) return
      const n = parseInt(String(quantity), 10)
      if (!Number.isFinite(n) || n < 0) return
      setSaving(true)
      try {
        const ref = doc(db, 'lists', listId, 'drinks', drinkId)
        await updateDoc(ref, {
          quantity: n,
          user_notes: userNotes.trim() ? userNotes.trim() : null,
          updatedAt: serverTimestamp(),
        })
        onDone?.()
      } catch (e) {
        console.error('[useEditListDrink] save failed:', e)
      } finally {
        setSaving(false)
      }
    },
    [drinkId, listId, quantity, userNotes]
  )

  // Soft delete (quantity = 0)
  const remove = useCallback(
    async (onDone?: () => void) => {
      if (!drinkId || !listId) return
      setSaving(true)
      try {
        const ref = doc(db, 'lists', listId, 'drinks', drinkId)
        await updateDoc(ref, {
          quantity: 0,
          updatedAt: serverTimestamp(),
        })
        onDone?.()
      } catch (e) {
        console.error('[useEditListDrink] remove (soft) failed:', e)
      } finally {
        setSaving(false)
      }
    },
    [drinkId, listId]
  )

  return {
    loading,
    saving,
    notFound,
    canSave,
    listResolved,
    verifiedServerOnce,

    name,
    typeName,
    imageLabel,
    alcoholPercent,
    volume,
    country,
    properties,
    description,
    pairingSuggestions,

    whereToFind,
    whereToFindList,

    quantity,
    setQuantity,
    userNotes,
    setUserNotes,

    save,
    remove,

    avgRating,
    ratingCount,
  }
}
