import { db, storage } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import * as ImagePicker from 'expo-image-picker'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import uuid from 'react-native-uuid'

export function useAdminCategoryEdit(id?: string) {
  const { t } = useStrings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [slug, setSlug] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('') // visas bara, ej redigerbar
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null) // visar i UI
  const [localImageUri, setLocalImageUri] = useState<string | null>(null) // nytt lokalt val

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        if (!id) {
          setNotFound(true)
          return
        }
        const snap = await getDoc(doc(db, 'drinkTypes', id))
        if (!snap.exists()) {
          setNotFound(true)
          return
        }
        const data = snap.data() as any
        if (cancelled) return

        setSlug(snap.id)
        setDisplayName(String(data?.name ?? ''))
        setImagePreviewUri(data?.icon ?? null)
      } catch (e) {
        console.error(t.admin_edit.category_edit_fail, e)
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

  const canSave = useMemo(() => !!id, [id])

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
      xhr.onerror = () => reject(new Error(t.admin_add.blob_failed))
      xhr.responseType = 'blob'
      xhr.open('GET', uri, true)
      xhr.send()
    })
    try {
      const storageRef = ref(storage, `drink_type_icons/${slug}-${uuid.v4()}.jpg`)
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' })
      return await getDownloadURL(storageRef)
    } finally {
      // @ts-ignore
      if (blob && typeof (blob as any).close === 'function') (blob as any).close()
    }
  }

  const save = async (onDone?: () => void) => {
    if (!id) return
    setSaving(true)
    try {
      const payload: Record<string, any> = {}
      if (localImageUri) {
        const imageUrl = await uploadImageAsync(localImageUri)
        payload.icon = imageUrl
      }
      if (Object.keys(payload).length > 0) {
        await updateDoc(doc(db, 'drinkTypes', id), payload)
      }
      onDone?.()
    } catch (e) {
      console.error('AdminCategoryEdit: save failed', e)
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

    // visningsfält
    slug,
    displayName,

    // bild
    imagePreviewUri,
    pickImage,

    // actions
    save,

    // validering
    canSave,
  }
}
