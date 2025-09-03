// hooks/useAdminAddForm.ts
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker'
import { addDoc, collection, doc, getDocs } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import uuid from 'react-native-uuid'

import { db, storage } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { PropertyRow, StoreRow } from '@/types/forms'
import { DrinkType } from '@/types/types'
import { validateAdminForm } from '@/utils/adminValidation'
import { toInt, toNum, upperAlpha3 } from '@/utils/parse'
import { useFocusEffect } from '@react-navigation/native'

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
        // v16: använd strängar – inte enum
        mediaTypes: ['images'] as const,
        // börja enkelt – lägg till allowsEditing när du fått upp pickern
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

  const uploadImageAsync = async (uri: string): Promise<string> => {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = () => resolve(xhr.response)
      xhr.onerror = () => reject(new Error(t.admin_add.blob_failed))
      xhr.responseType = 'blob'
      xhr.open('GET', uri, true)
      xhr.send()
    })
    try {
      const storageRef = ref(storage, `drink_images/${uuid.v4()}.jpg`)
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' }) // ✅
      return await getDownloadURL(storageRef)
    } finally {
      // @ts-ignore
      if (blob && typeof (blob as any).close === 'function') (blob as any).close()
    }
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
      }
      if (brand.trim()) payload.brand = brand.trim()
      if (country.trim()) payload.country = upperAlpha3(country)
      if (description.trim()) payload.description = description.trim()
      if (pairingSuggestions.trim()) payload.pairing_suggestions = pairingSuggestions.trim()
      if (cleanProps.length) payload.properties = cleanProps
      if (cleanShops.length) payload.where_to_find = cleanShops

      // Bild är valfri
      if (imageUri) {
        const imageUrl = await uploadImageAsync(imageUri)
        payload.image_label = imageUrl
      }

      const docRef = await addDoc(collection(db, 'drinks'), payload)

      // rensa formulär (om man vill lägga till fler)
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
