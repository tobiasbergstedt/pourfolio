// app/profile.tsx
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import InfoCard from '@/components/InfoCard'
import MasterButton from '@/components/MasterButton'
import ScreenContainer from '@/components/ScreenContainer'
import editStyles from '@/components/edit/styles'
import { useUser } from '@/hooks/useUser'
import { db, storage } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { extractStoragePathFromUrl, useImageUrl } from '@/utils/images'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, ref as sref, uploadBytes } from 'firebase/storage'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import uuid from 'react-native-uuid'

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { t } = useStrings()
  const user = useUser()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [localImageUri, setLocalImageUri] = useState<string | null>(null) // förhandsvisning lokalt
  const [saving, setSaving] = useState(false)

  // Basprofil från Firestore
  const profile = user.profile

  // Resolva visningsbild (storage-path ELLER URL). 128px räcker för avatar.
  const profileImageSource = useMemo(() => {
    // prioritera profile_image från Firestore, annars user.photoURL
    return profile?.profile_image ?? user.photoURL ?? null
  }, [profile?.profile_image, user.photoURL])

  const { url: avatarUrl } = useImageUrl(profileImageSource, 128)

  // Initiera formulärfält när profilen laddas in
  useEffect(() => {
    setFirstName((profile?.first_name ?? '').trim())
    setLastName((profile?.last_name ?? '').trim())
    setLocalImageUri(null) // rensa ev. tidigare lokal bild när backend uppdaterats
  }, [profile?.first_name, profile?.last_name])

  const canSave = useMemo(() => {
    // Spara om något fält ändrats eller om ny lokal bild finns
    const changedName =
      (firstName ?? '').trim() !== (profile?.first_name ?? '') ||
      (lastName ?? '').trim() !== (profile?.last_name ?? '')
    const changedPhoto = !!localImageUri
    return !!user.uid && (changedName || changedPhoto)
  }, [firstName, lastName, profile?.first_name, profile?.last_name, localImageUri, user.uid])

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (perm.status !== 'granted') {
      Alert.alert(t.general.error, t.general.permission_denied)
      return
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      selectionLimit: 1,
    })
    if (!res.canceled) {
      setLocalImageUri(res.assets[0].uri)
    }
  }

  // Ladda upp lokal bild → returnera storage-path (inte URL)
  const uploadProfileImage = async (uri: string, uid: string): Promise<string> => {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = () => resolve(xhr.response)
      xhr.onerror = () => reject(new Error('Failed to create blob for upload'))
      xhr.responseType = 'blob'
      xhr.open('GET', uri, true)
      xhr.send()
    })

    try {
      const filename = `${uuid.v4()}.jpg`
      const storagePath = `profile_images/${uid}/${filename}`
      const storageRef = ref(storage, storagePath)
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' })
      // (valfritt) du kan kontrollera att filen landade:
      await getDownloadURL(storageRef) // inte nödvändig för att spara path, men bra sanity-check
      return storagePath
    } finally {
      // @ts-ignore - vissa plattformar har close()
      if (typeof (blob as any).close === 'function') (blob as any).close()
    }
  }

  const handleSave = async () => {
    if (!user.uid) {
      Alert.alert(t.general.error, 'Du är inte inloggad.')
      return
    }
    setSaving(true)
    try {
      const oldPathOrUrl = profile?.profile_image ?? null

      let newPath: string | undefined
      if (localImageUri) {
        newPath = await uploadProfileImage(localImageUri, user.uid)
      }
      const payload: Record<string, any> = {
        first_name: (firstName ?? '').trim(),
        last_name: (lastName ?? '').trim(),
      }
      if (newPath) payload.profile_image = newPath

      // Se till att doc finns – välj själv om du vill använda setDoc({merge:true}) eller updateDoc
      const userRef = doc(db, 'users', user.uid)
      if (profile) {
        await updateDoc(userRef, payload)
      } else {
        await setDoc(userRef, {
          email_address: user.email ?? null,
          is_admin: false,
          ...payload,
        })
      }

      if (newPath && oldPathOrUrl) {
        safeDeleteProfileImage(oldPathOrUrl, newPath).catch(() => {})
      }

      Alert.alert(t.general.saved, t.general.changes_saved)
      router.back()
    } catch (e: any) {
      console.error('[profile/save] error', e)
      Alert.alert(t.general.error, e?.message ?? 'Kunde inte spara profil')
    } finally {
      setSaving(false)
    }
  }

  const PROFILE_VARIANTS = [64, 128, 256, 512] // om du genererar thumbnails för profilbilder

  async function safeDeleteProfileImage(oldPathOrUrl: string, newPath: string) {
    const oldPath =
      extractStoragePathFromUrl(oldPathOrUrl) /* http-url? */ ?? oldPathOrUrl /* redan path */
    if (!oldPath) return
    if (oldPath === newPath) return

    const dot = oldPath.lastIndexOf('.')
    const stem = dot === -1 ? oldPath : oldPath.slice(0, dot)

    const candidates = [
      oldPath, // original
      // ev. webp-varianter om du skapar dem server-side
      ...PROFILE_VARIANTS.map(n => `${stem}_${n}x${n}.webp`),
      `${stem}_orig.webp`,
    ]

    await Promise.allSettled(candidates.map(p => deleteObject(sref(storage, p))))
  }

  const handleCancel = () => {
    // kasta lokala ändringar och gå tillbaka
    setFirstName((profile?.first_name ?? '').trim())
    setLastName((profile?.last_name ?? '').trim())
    setLocalImageUri(null)
    router.back()
  }

  if (user.loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          paddingVertical: Styles.marginPaddingMain,
          paddingBottom: 24 + insets.bottom,
          gap: Styles.marginPaddingSmall,
        }}
      >
        {/* Profilbild */}
        <InfoCard label={t.profile.photo}>
          <View style={{ alignItems: 'center', gap: Styles.gapMain }}>
            {localImageUri ? (
              <Image
                source={{ uri: localImageUri }}
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                  backgroundColor: Colors.superLightGray,
                }}
              />
            ) : avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                  backgroundColor: Colors.superLightGray,
                }}
              />
            ) : (
              <View
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                  backgroundColor: Colors.superLightGray,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 36, color: Colors.gray }}>
                  {user.displayName?.[0]?.toUpperCase() ?? '🙂'}
                </Text>
              </View>
            )}
            <MasterButton title={t.profile.change_photo} onPress={pickImage} variant="secondary" />
          </View>
        </InfoCard>

        {/* Namn */}
        <View style={{ flexDirection: 'row', gap: Styles.gapMain }}>
          <InfoCard label={t.profile.first_name} style={{ flex: 1 }}>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t.profile.first_name}
              style={editStyles.textInput}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </InfoCard>
          <InfoCard label={t.profile.last_name} style={{ flex: 1 }}>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder={t.profile.last_name}
              style={editStyles.textInput}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </InfoCard>
        </View>

        {/* E-post (read-only) */}
        <InfoCard label={t.general.email}>
          <Text style={{ paddingVertical: 10, color: Colors.gray }}>{user.email ?? '—'}</Text>
        </InfoCard>

        {/* Knappar */}
        <View
          style={{
            flexDirection: 'row',
            gap: Styles.gapMain,
            marginTop: Styles.marginPaddingSmall,
          }}
        >
          <MasterButton
            title={saving ? t.general.saving : t.general.save}
            onPress={handleSave}
            disabled={!canSave || saving}
            variant="primary"
            style={{ flex: 1 }}
          />
          <MasterButton
            title={t.general.cancel}
            onPress={handleCancel}
            disabled={saving}
            variant="secondary"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}
