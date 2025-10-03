// app/edit.tsx
import AmountCard from '@/components/edit/AmountCard'
import DetailField from '@/components/edit/DetailField'
import EditDrinkLayout from '@/components/edit/EditDrinkLayout'
import HeaderCard from '@/components/edit/HeaderCard'
import PropertiesCard from '@/components/edit/PropertiesCard'
import styles from '@/components/edit/styles'
import LoadingIndicator from '@/components/LoadingIndicator'
import FullscreenImageViewer from '@/components/ui/FullscreenImageViewer'
import { useEditListDrink } from '@/hooks/useEditListDrink'
import { useStrings } from '@/providers/I18nProvider'
import { makeI18nTranslators } from '@/utils/i18n'
import { useImageUrl } from '@/utils/images'
import { useIsFocused } from '@react-navigation/native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, View } from 'react-native'

type InnerProps = { id?: string; listId?: string }

function EditDrinkScreenInner({ id, listId }: InnerProps) {
  const router = useRouter()
  const isFocused = useIsFocused()
  const { t } = useStrings()
  const { translateDrinkType } = useMemo(() => makeI18nTranslators(t), [t])

  const {
    loading,
    saving,
    notFound,
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
    avgRating,
    ratingCount,
    userNotes,
    setUserNotes,
    quantity,
    setQuantity,
    save,
    remove,
  } = useEditListDrink(id, listId)

  const { url: fullUrl } = useImageUrl(imageLabel ?? null, 'detail')
  const [imageOpen, setImageOpen] = useState(false)

  // Engångsflaggor
  const hasNavigatedRef = useRef(false)
  const suppressNotFoundRef = useRef(false)

  useEffect(() => {
    hasNavigatedRef.current = false
    suppressNotFoundRef.current = false
  }, [id, listId])

  const navigateBackSafe = useCallback(() => {
    if (hasNavigatedRef.current) return
    hasNavigatedRef.current = true
    if (router.canGoBack()) router.back()
    else router.replace('/')
  }, [router])

  const navigateHomeAfterDelete = useCallback(() => {
    if (hasNavigatedRef.current) return
    hasNavigatedRef.current = true
    router.replace('/')
  }, [router])

  // Saknade params → tillbaka/hem
  useEffect(() => {
    if (!isFocused || hasNavigatedRef.current) return
    if (!id || !listId) {
      Alert.alert(t.general.error, t.general.no_results_found, [
        { text: 'OK', onPress: navigateBackSafe },
      ])
    }
  }, [isFocused, id, listId, t.general.error, t.general.no_results_found, navigateBackSafe])

  // Visa “finns inte” först när servern är verifierad
  useEffect(() => {
    if (!isFocused || hasNavigatedRef.current) return
    if (listResolved && verifiedServerOnce && notFound && !suppressNotFoundRef.current && !saving) {
      Alert.alert(t.general.error, t.edit_drink.drink_not_found, [
        { text: 'OK', onPress: navigateBackSafe },
      ])
    }
  }, [
    isFocused,
    listResolved,
    verifiedServerOnce,
    notFound,
    saving,
    t.general.error,
    t.edit_drink.drink_not_found,
    navigateBackSafe,
  ])

  // Bekräftelse inför “ta bort” (soft delete)
  const confirmAndDelete = useCallback(() => {
    Alert.alert(
      t.edit_drink.remove_entry,
      t.edit_drink.confirm_remove,
      [
        { text: t.general.cancel, style: 'cancel' },
        {
          text: t.edit_drink.delete,
          style: 'destructive',
          onPress: () => {
            suppressNotFoundRef.current = true
            setImageOpen(false)
            navigateHomeAfterDelete()
            remove()
          },
        },
      ],
      { cancelable: true }
    )
  }, [
    remove,
    navigateHomeAfterDelete,
    t.edit_drink.remove_entry,
    t.edit_drink.confirm_remove,
    t.general.cancel,
    t.edit_drink.delete,
  ])

  if (!id || !listId) return null
  if (loading || !listResolved) return <LoadingIndicator message={t.edit_drink.loading} />
  if (saving) return <LoadingIndicator message={t.general.saving} />
  if (listResolved && verifiedServerOnce && notFound && !suppressNotFoundRef.current) return null

  const alcoholValue =
    typeof alcoholPercent === 'number' ? `${alcoholPercent}%` : t.home.unknown_alcohol
  const volumeValue =
    typeof volume === 'number' ? `${volume} ${t.general.ml}` : t.home.unknown_volume
  const countryValue = country ?? t.home.unknown_country

  // Prisformatterare (svensk) – används bara för HeaderCard-visningen
  const formatPrice = (n: number) => {
    try {
      return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(n)
    } catch {
      return `${n.toFixed(2)} kr`
    }
  }

  // Kondenserad sträng till HeaderCard (frivilligt)
  const shopsDisplay =
    whereToFindList && whereToFindList.length
      ? whereToFindList.map(s => `${s.name} – ${formatPrice(s.price)}`).join(' · ')
      : whereToFind // fallback utan pris

  const drinkForHeader = {
    id,
    name,
    image_label: imageLabel,
    alcohol_percent: typeof alcoholPercent === 'number' ? alcoholPercent : null,
    volume: volume ?? null,
    country: country ?? null,
    properties: properties ?? [],
    description: description ?? null,
    pairing_suggestions: pairingSuggestions ?? null,
    where_to_find: shopsDisplay ?? null,
    rating: {
      average_rating: avgRating ?? 0,
      number_of_ratings: ratingCount ?? 0,
      amount_of_ratings: ratingCount ?? 0,
    },
  } as any

  return (
    <>
      <EditDrinkLayout
        onSave={() => save(navigateBackSafe)}
        onDelete={confirmAndDelete}
        saveLabel={t.edit_drink.save_changes}
        deleteLabel={t.edit_drink.remove_entry}
      >
        <HeaderCard
          drink={drinkForHeader}
          onImagePress={() => setImageOpen(true)}
          userRating={undefined as any}
          avgRating={avgRating ?? 0}
          ratingCount={ratingCount ?? 0}
          updateUserRating={undefined as any}
        />

        <View style={styles.cardRow}>
          <DetailField
            label={t.edit_drink.drink_type}
            value={translateDrinkType(typeName, { prettifyFallback: true })}
          />
          <DetailField label={t.edit_drink.alcohol} value={alcoholValue} />
        </View>

        <View style={styles.cardRow}>
          <DetailField label={t.edit_drink.origin} value={countryValue} />
          <DetailField label={t.edit_drink.volume} value={volumeValue} />
        </View>

        {!!(properties && properties.length) && (
          <PropertiesCard label={t.edit_drink.properties} properties={properties} />
        )}

        <DetailField
          label={t.edit_drink.user_notes}
          value={userNotes}
          editable
          onChangeText={setUserNotes}
          placeholder={t.edit_drink.user_notes_placeholder}
          inputProps={{ multiline: true, numberOfLines: 3, maxLength: 1000, returnKeyType: 'done' }}
        />

        <AmountCard
          label={t.edit_drink.amount}
          value={quantity}
          onChange={setQuantity}
          min={0}
          step={1}
        />

        {!!description && <DetailField label={t.edit_drink.description} value={description} />}

        {!!pairingSuggestions && (
          <DetailField label={t.edit_drink.pairing_suggestions} value={pairingSuggestions} />
        )}

        {/* 👇 Här använder vi array-stödet i DetailField för butik + pris */}
        {!!whereToFindList?.length && (
          <DetailField label={t.edit_drink.where_to_find} value={whereToFindList} />
        )}
      </EditDrinkLayout>

      <FullscreenImageViewer
        visible={imageOpen}
        onClose={() => setImageOpen(false)}
        uri={fullUrl ?? null}
      />
    </>
  )
}

// ⬇️ Wrapper som tvingar remount när id/listId ändras
export default function EditDrinkScreen() {
  const { id: idParam, listId: listIdParam } = useLocalSearchParams<{
    id?: string
    listId?: string
  }>()
  const id = typeof idParam === 'string' ? idParam : undefined
  const listId = typeof listIdParam === 'string' && listIdParam.length > 0 ? listIdParam : undefined
  const key = `${id ?? 'noid'}:${listId ?? 'nolist'}`
  return <EditDrinkScreenInner key={key} id={id} listId={listId} />
}
