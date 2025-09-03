import { db, storage } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { PropertyRow, StoreRow } from '@/types/forms'
import type { DrinkType } from '@/types/types'
import { validateAdminForm } from '@/utils/adminValidation'
import * as ImagePicker from 'expo-image-picker'
import { collection, doc, DocumentReference, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import uuid from 'react-native-uuid'

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
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null)
  const [localImageUri, setLocalImageUri] = useState<string | null>(null)

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
            ? props.map((p: any) => ({ name: String(p.name ?? ''), value: String(p.value ?? '') }))
            : [{ name: '', value: '' }]
        )

        const shops = Array.isArray(data.where_to_find) ? data.where_to_find : []
        setWhereToFind(
          shops.length
            ? shops.map((s: any) => ({ name: String(s.name ?? ''), price: String(s.price ?? '') }))
            : [{ name: '', price: '' }]
        )

        setImagePreviewUri(data.image_label ?? null)

        const ref = data.drink_type as DocumentReference | undefined
        const type = ref ? (types.find(t => t.id === ref.id) ?? null) : null
        setSelectedType(type)
      } catch (e) {
        console.error('Admin edit: load failed', e)
        Alert.alert(t.general.error, t.general.something_went_wrong)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [id])

  const { errors, canSave } = useMemo(() => {
    // samma basvalidering som add-flow (kan tweakas)
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
  }, [name, selectedType?.id, volume, alcoholPercent, country, ratingAverage, ratingCount])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(t.general.error, t.general.permission_denied)
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Expo ImagePicker v16
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri)
      setImagePreviewUri(result.assets[0].uri)
    }
  }

  const uploadImageAsync = async (uri: string): Promise<string> => {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = () => resolve(xhr.response)
      xhr.onerror = () => reject(new Error(t.admin_add?.blob_failed ?? 'Blob creation failed'))
      xhr.responseType = 'blob'
      xhr.open('GET', uri, true)
      xhr.send()
    })
    try {
      const storageRef = ref(storage, `drink_images/${uuid.v4()}.jpg`)
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' })
      return await getDownloadURL(storageRef)
    } finally {
      // @ts-ignore
      if (blob && typeof (blob as any).close === 'function') (blob as any).close()
    }
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
        properties
          .map(p => ({ name: p.name.trim(), value: p.value }))
          .filter(p => p.name && typeof p.value === 'number') ?? []

      const cleanShops =
        whereToFind
          .map(s => ({ name: s.name.trim(), price: s.price }))
          .filter(s => s.name && typeof s.price === 'number') ?? []

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

      if (localImageUri) {
        const imageUrl = await uploadImageAsync(localImageUri)
        payload.image_label = imageUrl
      }

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
    imagePreviewUri,
    pickImage,

    // actions
    save,
  }
}
