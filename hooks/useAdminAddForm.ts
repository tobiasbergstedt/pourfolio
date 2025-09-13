import { useFocusEffect } from '@react-navigation/native'
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker'
import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import { ref as sref, uploadBytes } from 'firebase/storage'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'

import { db, storage } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { PropertyRow, StoreRow } from '@/types/forms'
import { DrinkType } from '@/types/types'
import { validateAdminForm } from '@/utils/adminValidation'
import { toInt, toNum, upperAlpha3 } from '@/utils/parse'

export function useAdminAddForm() {
  const { t } = useStrings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([])
  const [selectedType, setSelectedType] = useState<DrinkType | null>(null)

  // basfält
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [volume, setVolume] = useState('')
  const [imageUri, setImageUri] = useState<string | null>(null)

  // extra fält
  const [country, setCountry] = useState('')
  const [alcoholPercent, setAlcoholPercent] = useState('')
  const [description, setDescription] = useState('')
  const [pairingSuggestions, setPairingSuggestions] = useState('')
  const [ratingCount, setRatingCount] = useState('')
  const [ratingAverage, setRatingAverage] = useState('')

  const [properties, setProperties] = useState<PropertyRow[]>([{ name: '', value: Number.NaN }])
  const [whereToFind, setWhereToFind] = useState<StoreRow[]>([{ name: '', price: Number.NaN }])

  const { errors, canSave } = useMemo(() => {
    const { errors, canSave } = validateAdminForm(
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
    return { errors, canSave }
  }, [name, selectedType?.id, volume, alcoholPercent, country, ratingAverage, ratingCount])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const snap = await getDocs(collection(db, 'drinkTypes'))
        const types = snap.docs
          .map(d => ({ id: d.id, ...(d.data() as any) }))
          .filter(Boolean) as DrinkType[]
        setDrinkTypes(types)
      } catch (e) {
        console.error(t.admin_add.drink_type_fetch_failed, e)
        Alert.alert(t.general.error, t.general.something_went_wrong)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  // reset på blur
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedType(null)
        setName('')
        setBrand('')
        setVolume('')
        setImageUri(null)

        setCountry('')
        setAlcoholPercent('')
        setDescription('')
        setPairingSuggestions('')
        setRatingCount('')
        setRatingAverage('')
        setProperties([{ name: '', value: Number.NaN }])
        setWhereToFind([{ name: '', price: Number.NaN }])
      }
    }, [])
  )

  const pickImage = async () => {
    try {
      const perm = await requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert(t.general.error, t.general.permission_denied)
        return
      }
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'] as const, // Expo SDK 50+: string-variant funkar fint
        quality: 0.9,
        selectionLimit: 1,
      })
      if (!result.canceled) {
        setImageUri(result.assets[0].uri)
      }
    } catch (e: any) {
      console.error('[pickImage] error', e)
      Alert.alert(t.general.error, e?.message ?? String(e))
    }
  }

  // Gissa filändelse från URI/contentType (för storage-path)
  const guessExt = (uri: string, contentType?: string) => {
    const u = uri.toLowerCase()
    if (contentType?.includes('png') || u.endsWith('.png')) return 'png'
    if (contentType?.includes('webp') || u.endsWith('.webp')) return 'webp'
    return 'jpg'
  }

  // Ladda upp bilden och returnera STORAGE-PATH (inte URL)
  const uploadImageAsPath = async (docId: string, uri: string): Promise<string> => {
    // hämta Blob från lokal URI
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
    const storageRef = sref(storage, storagePath)

    await uploadBytes(storageRef, blob, {
      contentType,
      cacheControl: 'public, max-age=31536000',
    })
    // Din Cloud Function triggas nu och skapar thumbnails + ev. _orig.webp
    return storagePath
  }

  const save = async (goHomeAfter = false, onDone?: (id: string) => void) => {
    // blockera endast om obligatoriska fält failar
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

      const cleanProps = properties
        .map(p => ({ name: p.name.trim(), value: p.value }))
        .filter(p => p.name.trim() && Number.isFinite(p.value))

      const cleanShops = whereToFind
        .map(s => ({ name: s.name.trim(), price: s.price }))
        .filter(s => s.name.trim() && Number.isFinite(s.price))

      // Skapa ID i förväg så vi kan använda det i storage-path
      const docRef = doc(collection(db, 'drinks'))

      let imagePath: string | null = null
      if (imageUri) {
        imagePath = await uploadImageAsPath(docRef.id, imageUri) // <-- STORAGE-PATH
      }

      const payload: Record<string, any> = {
        name: name.trim(),
        drink_type: doc(db, 'drinkTypes', selectedType!.id),
        volume: volumeNum,
        alcohol_percent: alcNum,
        is_alcohol_free: alcNum < 1.5,
        rating: {
          average_rating: ratingAvgNum,
          number_of_ratings: ratingCountNum,
          amount_of_ratings: ratingCountNum,
        },
        // valfria fält om ifyllda
        ...(brand.trim() && { brand: brand.trim() }),
        ...(country.trim() && { country: upperAlpha3(country) }),
        ...(description.trim() && { description: description.trim() }),
        ...(pairingSuggestions.trim() && { pairing_suggestions: pairingSuggestions.trim() }),
        ...(cleanProps.length && { properties: cleanProps }),
        ...(cleanShops.length && { where_to_find: cleanShops }),
        // Bild: spara STORAGE-PATH
        ...(imagePath && { image_label: imagePath }),
      }

      await setDoc(docRef, payload)

      // rensa formuläret
      setName('')
      setBrand('')
      setVolume('')
      setImageUri(null)
      setSelectedType(null)
      setCountry('')
      setAlcoholPercent('')
      setDescription('')
      setPairingSuggestions('')
      setRatingCount('')
      setRatingAverage('')
      setProperties([{ name: '', value: Number.NaN }])
      setWhereToFind([{ name: '', price: Number.NaN }])

      onDone?.(docRef.id)
      return docRef.id
    } finally {
      setSaving(false)
    }
  }

  return {
    // state
    loading,
    saving,
    drinkTypes,
    selectedType,
    setSelectedType,
    name,
    setName,
    brand,
    setBrand,
    volume,
    setVolume,
    imageUri,
    setImageUri,
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

    // actions
    pickImage,
    save,

    // validation
    errors,
    canSave,
  }
}
