import AmountCard from '@/components/edit/AmountCard'
import DetailField from '@/components/edit/DetailField'
import EditDrinkLayout from '@/components/edit/EditDrinkLayout'
import HeaderCard from '@/components/edit/HeaderCard'
import PropertiesCard from '@/components/edit/PropertiesCard'
import styles from '@/components/edit/styles'
import LoadingIndicator from '@/components/LoadingIndicator'
import FullscreenImageViewer from '@/components/ui/FullscreenImageViewer'
import { useEditDrink } from '@/hooks/useEditDrink'
import { useStrings } from '@/providers/I18nProvider'
import { makeI18nTranslators } from '@/utils/i18n'
import { useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { View } from 'react-native'

export default function EditDrinkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const {
    loading,
    saving,
    drink,
    quantity,
    setQuantity,
    userRating,
    avgRating,
    ratingCount,
    handleSave,
    updateUserRating,
    handleDelete,
    countryName,
    alcoholPercent,
    drinkTypeName,
    userNotes,
    setUserNotes,
  } = useEditDrink(id)
  const { t } = useStrings()
  const { translateDrinkType } = useMemo(() => makeI18nTranslators(t), [t])

  const [imageOpen, setImageOpen] = useState(false)

  const translatedType = translateDrinkType(drinkTypeName, { prettifyFallback: true })

  if (loading || !drink) {
    return <LoadingIndicator message={t.edit_drink.loading} />
  }

  if (saving) {
    return <LoadingIndicator message={t.general.saving} />
  }

  return (
    <>
      <EditDrinkLayout
        onSave={() =>
          handleSave({
            user_notes: userNotes?.trim() ? userNotes.trim() : null,
          })
        }
        onDelete={handleDelete}
        saveLabel={t.edit_drink.save_changes}
        deleteLabel={t.edit_drink.remove_entry}
      >
        <HeaderCard
          drink={drink}
          onImagePress={() => setImageOpen(true)}
          userRating={userRating}
          avgRating={avgRating}
          ratingCount={ratingCount}
          updateUserRating={updateUserRating}
        />

        <View style={styles.cardRow}>
          <DetailField label={t.edit_drink.drink_type} value={translatedType} />
          <DetailField label={t.edit_drink.alcohol} value={alcoholPercent} />
        </View>

        <View style={styles.cardRow}>
          <DetailField label={t.edit_drink.origin} value={countryName} />
          <DetailField label={t.edit_drink.volume} value={`${drink.volume} ${t.general.ml}`} />
        </View>

        <PropertiesCard label={t.edit_drink.properties} properties={drink.properties} />

        <DetailField
          label={t.edit_drink.user_notes}
          value={userNotes}
          editable
          onChangeText={setUserNotes}
          placeholder={t.edit_drink.user_notes_placeholder}
          inputProps={{
            multiline: true,
            numberOfLines: 3,
            maxLength: 1000,
            returnKeyType: 'done',
          }}
        />

        <DetailField label={t.edit_drink.description} value={drink.description} />
        <DetailField label={t.edit_drink.pairing_suggestions} value={drink.pairing_suggestions} />
        <DetailField label={t.edit_drink.where_to_find} value={drink.where_to_find} />

        <AmountCard
          label={t.edit_drink.amount}
          value={quantity}
          onChange={setQuantity}
          min={0}
          step={1}
        />
      </EditDrinkLayout>

      <FullscreenImageViewer
        visible={imageOpen}
        onClose={() => setImageOpen(false)}
        uri={drink.image_label}
      />
    </>
  )
}
