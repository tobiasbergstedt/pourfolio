// components/admin-add/ImagePickerField.tsx
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import styles from '@/components/admin-add/styles'
import MasterButton from '@/components/MasterButton'
import { useStrings } from '@/providers/I18nProvider'
import React from 'react'
import { Image, View } from 'react-native'

type Props = {
  imageUri: string | null
  onPick: () => void
  label?: string
}

export default function ImagePickerField({ imageUri, onPick }: Props) {
  const { t } = useStrings()

  return (
    <View style={{ gap: Styles.gapMain }}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={[styles.preview, { backgroundColor: Colors.superLightGray }]} />
      )}
      <MasterButton title={t.admin_add.choose_image} onPress={onPick} variant="primary" />
    </View>
  )
}
