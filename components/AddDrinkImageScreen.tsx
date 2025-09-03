import Styles from '@/assets/styles'
import sharedStyles from '@/components/shared/styles'
import { useStrings } from '@/providers/I18nProvider'
import * as ImagePicker from 'expo-image-picker'
import { addDoc, collection } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Button, Image, TextInput, View } from 'react-native'
import uuid from 'react-native-uuid'
import { auth, db, storage } from '../lib/firebase'

export default function AddDrinkImageScreen() {
  const [name, setName] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { t } = useStrings()

  // 1. Välj bild från galleri
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  // 2. Ladda upp bild till Firebase Storage
  const uploadImageAsync = async (uri: string): Promise<string> => {
    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = () => resolve(xhr.response)
      xhr.onerror = () => reject(new Error('Blob creation failed'))
      xhr.responseType = 'blob'
      xhr.open('GET', uri, true)
      xhr.send()
    })

    const imageId = uuid.v4() as string
    const refPath = `drink_images/${imageId}.jpg`
    const storageRef = ref(storage, refPath)

    await uploadBytes(storageRef, blob)
    const downloadUrl = await getDownloadURL(storageRef)

    return downloadUrl
  }

  // 3. Spara drycken till Firestore
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t.add_drink.enter_name)
      return
    }

    if (!auth.currentUser) {
      Alert.alert(t.add_drink.no_user_logged_in)
      return
    }

    try {
      setUploading(true)

      let imageUrl = null
      if (image) {
        imageUrl = await uploadImageAsync(image)
      }

      await addDoc(collection(db, 'drinks'), {
        name,
        imageUrl,
        created_at: Date.now(),
      })

      Alert.alert(t.add_drink.drink_saved)
      setName('')
      setImage(null)
    } catch (err) {
      console.error(t.add_drink.error_uploading, err)
      Alert.alert(t.add_drink.error_uploading_message)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    const testUpload = async () => {
      if (!auth.currentUser) return console.log(t.add_drink.not_logged_in)

      const blob = new Blob(['hello'], { type: 'text/plain' })
      const refPath = `drink_images/testfile.txt`
      const storageRef = ref(storage, refPath)

      try {
        await uploadBytes(storageRef, blob)
        console.log(t.add_drink.upload_ok)
      } catch (err) {
        console.error(t.add_drink.error_test_upload, err)
      }
    }

    testUpload()
  }, [])

  return (
    <View style={sharedStyles.addDrinkImageContainer}>
      <TextInput
        placeholder={t.add_drink.drink_name}
        value={name}
        onChangeText={setName}
        style={sharedStyles.addDrinkImageInput}
      />

      <Button title={t.add_drink.choose_image} onPress={pickImage} />

      {image && <Image source={{ uri: image }} style={sharedStyles.addDrinkImageImage} />}

      <Button
        title={uploading ? t.add_drink.saving : t.add_drink.save}
        onPress={handleSave}
        disabled={uploading}
      />

      {uploading && <ActivityIndicator style={{ marginTop: Styles.marginPaddingMini }} />}
    </View>
  )
}
