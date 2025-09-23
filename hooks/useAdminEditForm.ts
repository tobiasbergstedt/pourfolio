import { db, storage } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { PropertyRow, StoreRow } from '@/types/forms'
import type { DrinkType } from '@/types/types'
import { validateAdminForm } from '@/utils/adminValidation'
import { extractStoragePathFromUrl, getBestThumb } from '@/utils/images'
import * as ImagePicker from 'expo-image-picker'
import { collection, doc, DocumentReference, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { ref as sref, uploadBytes } from 'firebase/storage'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'

const toNum = (v: string) => {
  const n = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}
const toInt = (v: string) => {
  const n = parseInt(String(v), 10)
  return Number.isFinite(n) ? n : undefined
}
const upperAlpha3 = (v: string) =>
  v
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 3)

// gissa filändelse för storage-path
const guessExt = (uri: string, contentType?: string) => {
  const u = uri.toLowerCase()
  if (contentType?.includes('png') || u.endsWith('.png')) return 'png'
  if (contentType?.includes('webp') || u.endsWith('.webp')) return 'webp'
  return 'jpg'
}

export function useAdminEditForm(id?: string) {
  const { t } = useStrings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([])
  const [selectedType, setSelectedType] = useState<DrinkType | null>(null)

  // fält
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [volume, setVolume] = useState('')
  const [country, setCountry] = useState('')
  const [alcoholPercent, setAlcoholPercent] = useState('')
  const [description, setDescription] = useState('')
  const [pairingSuggestions, setPairingSuggestions] = useState('')
  const [ratingCount, setRatingCount] = useState('')
  const [ratingAverage, setRatingAverage] = useState('')

  const [properties, setProperties] = useState<PropertyRow[]>([{ name: '', value: 0 }])
  const [whereToFind, setWhereToFind] = useState<StoreRow[]>([{ name: '', price: 0 }])

  // bild
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null) // URL för visning
  const [imageStoragePath, setImageStoragePath] = useState<string | null>(null) // path från doc (eller extraherad)
  const [localImageUri, setLocalImageUri] = useState<string | null>(null) // nyvald bild (lokal)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        if (!id) {
          setNotFound(true)
          return
        }
        const [typeSnap, drinkSnap] = await Promise.all([
          getDocs(collection(db, 'drinkTypes')),
          getDoc(doc(db, 'drinks', id)),
        ])
        if (cancelled) return

        const types = typeSnap.docs
          .map(d => ({ id: d.id, ...(d.data() as any) }))
          .filter(Boolean) as DrinkType[]
        setDrinkTypes(types)

        if (!drinkSnap.exists()) {
          setNotFound(true)
          return
        }
        const data = drinkSnap.data() as any

        // map doc -> state
        setName(String(data.name ?? ''))
        setBrand(String(data.brand ?? ''))
        setVolume(typeof data.volume === 'number' ? String(data.volume) : '')
        setCountry(String(data.country ?? ''))
        setAlcoholPercent(
          typeof data.alcohol_percent === 'number' ? String(data.alcohol_percent) : ''
        )
        setDescription(String(data.description ?? ''))
        setPairingSuggestions(String(data.pairing_suggestions ?? ''))

        const r: any = data.rating ?? {}
        setRatingAverage(typeof r.average_rating === 'number' ? String(r.average_rating) : '')
        const count =
          typeof r.number_of_ratings === 'number'
            ? r.number_of_ratings
            : typeof r.amount_of_ratings === 'number'
              ? r.amount_of_ratings
              : undefined
        setRatingCount(typeof count === 'number' ? String(count) : '')

        const props = Array.isArray(data.properties) ? data.properties : []
        setProperties(
          props.length
            ? props.map((p: any) => ({ name: String(p.name ?? ''), value: p.value }))
            : [{ name: '', value: 0 }]
        )

        const shops = Array.isArray(data.where_to_find) ? data.where_to_find : []
        setWhereToFind(
          shops.length
            ? shops.map((s: any) => ({ name: String(s.name ?? ''), price: s.price }))
            : [{ name: '', price: 0 }]
        )

        // Bild: doc kan ha path ELLER URL – spara path i state + skaffa preview-URL
        const rawLabel: string | null = data.image_label ?? null
        const path =
          rawLabel && /^https?:\/\//i.test(rawLabel)
            ? (extractStoragePathFromUrl(rawLabel) ?? null)
            : (rawLabel ?? null)
        setImageStoragePath(path)

        if (rawLabel) {
          // Hämta en lämplig visnings-URL (thumb/orig), funkar för både path & URL
          try {
            const res = await getBestThumb(rawLabel, 128)
            if (!cancelled) setImagePreviewUri(res.url)
          } catch {
            if (!cancelled) setImagePreviewUri(null)
          }
        } else {
          setImagePreviewUri(null)
        }

        const ref = data.drink_type as DocumentReference | undefined
        const type = ref ? (types.find(t => t.id === ref.id) ?? null) : null
        setSelectedType(type)
      } catch (e) {
        console.error(t.admin_edit.admin_edit_fail, e)
        Alert.alert(t.general.error, t.general.something_went_wrong)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [id, t])

  const { errors, canSave } = useMemo(() => {
    return validateAdminForm(
      {
        name,
        selectedTypeId: selectedType?.id,
        volume,
        alcoholPercent,
        country,
        ratingAverage,
        ratingCount,
      },
      t
    )
  }, [name, selectedType?.id, volume, alcoholPercent, country, ratingAverage, ratingCount, t])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(t.general.error, t.general.permission_denied)
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      selectionLimit: 1,
    })
    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri)
      setImagePreviewUri(result.assets[0].uri) // visa direkt
    }
  }

  // Ladda upp vald bild som STORAGE-PATH: drink_images/<docId>.<ext>
  const uploadImageAsPath = async (docId: string, uri: string): Promise<string> => {
    const res = await fetch(uri)
    const blob = await res.blob()
    const contentType =
      blob.type ||
      (uri.toLowerCase().endsWith('.png')
        ? 'image/png'
        : uri.toLowerCase().endsWith('.webp')
          ? 'image/webp'
          : 'image/jpeg')
    const ext = guessExt(uri, contentType)
    const storagePath = `drink_images/${docId}.${ext}`
    await uploadBytes(sref(storage, storagePath), blob, {
      contentType,
      cacheControl: 'public, max-age=31536000',
    })
    return storagePath
  }

  const save = async (onDone?: () => void) => {
    if (!id) return
    const check = validateAdminForm(
      {
        name,
        selectedTypeId: selectedType?.id,
        volume,
        alcoholPercent,
        country,
        ratingAverage,
        ratingCount,
      },
      t
    )
    if (!check.canSave) {
      Alert.alert(t.general.error, t.general.fill_all_fields)
      return
    }

    setSaving(true)
    try {
      const volumeNum = toNum(volume)!
      const alcNum = toNum(alcoholPercent)!
      const ratingCountNum = toInt(ratingCount) ?? 0
      const ratingAvgNum = toNum(ratingAverage) ?? 0

      const cleanProps =
        (properties ?? [])
          .map(p => ({ name: String(p.name ?? '').trim(), value: Number(p.value) }))
          .filter(p => p.name && Number.isFinite(p.value)) ?? []

      const cleanShops =
        (whereToFind ?? [])
          .map(s => ({ name: String(s.name ?? '').trim(), price: Number(s.price) }))
          .filter(s => s.name && Number.isFinite(s.price)) ?? []

      // Baspayload
      const payload: Record<string, any> = {
        name: name.trim(),
        drink_type: selectedType ? doc(db, 'drinkTypes', selectedType.id) : null,
        volume: volumeNum,
        alcohol_percent: alcNum,
        is_alcohol_free: alcNum < 1.5,
        rating: {
          average_rating: ratingAvgNum,
          number_of_ratings: ratingCountNum,
          amount_of_ratings: ratingCountNum,
        },
        brand: brand.trim() || null,
        country: country.trim() ? upperAlpha3(country) : null,
        description: description.trim() || null,
        pairing_suggestions: pairingSuggestions.trim() || null,
        properties: cleanProps,
        where_to_find: cleanShops,
      }

      // Ny bild vald → ladda upp och spara STORAGE-PATH i image_label
      if (localImageUri) {
        const path = await uploadImageAsPath(id, localImageUri)
        payload.image_label = path
        setImageStoragePath(path)
      }

      // (Frivillig migrering) Om ingen ny bild vald men doc hade URL: konvertera till path
      // Låt bli om du inte vill tysta ändra gamla poster:
      // else if (!localImageUri && imageStoragePath) {
      //   payload.image_label = imageStoragePath
      // }

      await updateDoc(doc(db, 'drinks', id), payload)
      onDone?.()
    } catch (e) {
      console.error('Admin edit: save failed', e)
      Alert.alert(t.general.error, t.general.unable_to_save)
    } finally {
      setSaving(false)
    }
  }

  return {
    // status
    loading,
    saving,
    notFound,

    // validering
    errors,
    canSave,

    // typer
    drinkTypes,
    selectedType,
    setSelectedType,

    // fält
    name,
    setName,
    brand,
    setBrand,
    volume,
    setVolume,
    country,
    setCountry,
    alcoholPercent,
    setAlcoholPercent,
    description,
    setDescription,
    pairingSuggestions,
    setPairingSuggestions,
    ratingCount,
    setRatingCount,
    ratingAverage,
    setRatingAverage,
    properties,
    setProperties,
    whereToFind,
    setWhereToFind,

    // bild
    imagePreviewUri, // URL för visning
    pickImage,

    // actions
    save,
  }
}
