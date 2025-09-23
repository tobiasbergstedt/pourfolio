import Styles from '@/assets/styles'
import ImagePickerField from '@/components/admin-add/ImagePickerField'
import PropertyList from '@/components/admin-add/PropertyList'
import WhereToFindList from '@/components/admin-add/WhereToFindList'
import CategoryGrid from '@/components/CategoryGrid'
import editStyles from '@/components/edit/styles'
import InfoCard from '@/components/InfoCard'
import LoadingIndicator from '@/components/LoadingIndicator'
import MasterButton from '@/components/MasterButton'
import ScreenContainer from '@/components/ScreenContainer'
import sharedStyles from '@/components/shared/styles'
import { useAdminEditForm } from '@/hooks/useAdminEditForm'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useStrings } from '@/providers/I18nProvider'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { Alert, Platform, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AdminEditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const { t } = useStrings()

  const f = useAdminEditForm(id)

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert(t.general.error, t.navigation?.not_authorized)
      router.replace('/')
    }
  }, [adminLoading, isAdmin, router])

  if (adminLoading || f.loading) return <LoadingIndicator message={t.general.loading} />
  if (f.saving) return <LoadingIndicator message={t.general.saving} />
  if (f.notFound) {
    return (
      <ScreenContainer>
        <InfoCard label={t.general.error}>
          <Text>{t.general.no_results_found}</Text>
        </InfoCard>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingVertical: Styles.marginPaddingMain,
          paddingBottom: 24 + insets.bottom,
          gap: Styles.marginPaddingSmall,
        }}
      >
        <InfoCard label={t.admin_add.name}>
          <TextInput
            value={f.name}
            onChangeText={f.setName}
            placeholder={t.admin_add.name_placeholder}
            style={editStyles.textInput}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {!!f.errors.name && <Text style={helperError}>{f.errors.name}</Text>}
        </InfoCard>

        <InfoCard label={t.admin_add.image}>
          <ImagePickerField imageUri={f.imagePreviewUri} onPick={f.pickImage} />
        </InfoCard>

        <View style={{ flexDirection: 'row', gap: Styles.gapMain }}>
          <InfoCard label={t.admin_add.brand} style={{ flex: 1 }}>
            <TextInput
              value={f.brand}
              onChangeText={f.setBrand}
              placeholder={t.admin_add.brand_placeholder}
              style={editStyles.textInput}
              autoCapitalize="words"
            />
          </InfoCard>
          <InfoCard label={t.general.country} style={{ flex: 1 }}>
            <TextInput
              value={f.country}
              onChangeText={f.setCountry}
              placeholder={t.admin_add.country_placeholder}
              autoCapitalize="characters"
              maxLength={3}
              style={editStyles.textInput}
            />
            {!!f.errors.country && <Text style={helperWarn}>{f.errors.country}</Text>}
          </InfoCard>
        </View>

        <View style={{ flexDirection: 'row', gap: Styles.gapMain }}>
          <InfoCard label={t.edit_drink.volume} style={{ flex: 1 }}>
            <TextInput
              value={f.volume}
              onChangeText={f.setVolume}
              placeholder={t.general.ml}
              keyboardType="numeric"
              style={editStyles.textInput}
            />
            {!!f.errors.volume && <Text style={helperError}>{f.errors.volume}</Text>}
          </InfoCard>
          <InfoCard label={t.edit_drink.alcohol} style={{ flex: 1 }}>
            <TextInput
              value={f.alcoholPercent}
              onChangeText={f.setAlcoholPercent}
              placeholder={t.admin_add.percentage_placeholder}
              keyboardType="decimal-pad"
              style={editStyles.textInput}
            />
            {!!f.errors.alcoholPercent && (
              <Text style={helperError}>{f.errors.alcoholPercent}</Text>
            )}
          </InfoCard>
        </View>

        <InfoCard label={t.edit_drink.description}>
          <TextInput
            value={f.description}
            onChangeText={f.setDescription}
            placeholder={t.edit_drink.description_placeholder}
            style={[editStyles.textInput, { minHeight: 88 }]}
            multiline
          />
        </InfoCard>

        <View style={{ flexDirection: 'row', gap: Styles.gapMain }}>
          <InfoCard label={t.admin_add.amount_of_ratings} style={{ flex: 1 }}>
            <TextInput
              value={f.ratingCount}
              onChangeText={f.setRatingCount}
              placeholder="0"
              keyboardType="numeric"
              style={editStyles.textInput}
            />
            {!!f.errors.ratingCount && <Text style={helperWarn}>{f.errors.ratingCount}</Text>}
          </InfoCard>
          <InfoCard label={t.admin_add.average_rating} style={{ flex: 1 }}>
            <TextInput
              value={f.ratingAverage}
              onChangeText={f.setRatingAverage}
              placeholder="0–5"
              keyboardType="decimal-pad"
              style={editStyles.textInput}
            />
            {!!f.errors.ratingAverage && <Text style={helperWarn}>{f.errors.ratingAverage}</Text>}
          </InfoCard>
        </View>

        <InfoCard label={t.edit_drink.pairing_suggestions}>
          <TextInput
            value={f.pairingSuggestions}
            onChangeText={f.setPairingSuggestions}
            placeholder={t.edit_drink.pairing_suggestions_placeholder}
            style={[editStyles.textInput, { minHeight: 72 }]}
            multiline
          />
        </InfoCard>

        <InfoCard label={t.edit_drink.properties}>
          <PropertyList rows={f.properties} setRows={f.setProperties} />
        </InfoCard>

        <InfoCard label={t.edit_drink.where_to_find}>
          <WhereToFindList rows={f.whereToFind} setRows={f.setWhereToFind} />
        </InfoCard>

        <InfoCard label={t.add_drink.choose_category}>
          <CategoryGrid
            data={f.drinkTypes}
            selectedId={f.selectedType?.id}
            onSelect={f.setSelectedType}
            styleOverrides={{
              cell: sharedStyles.typeCell,
              cellActive: sharedStyles.typeCellActive,
              icon: sharedStyles.typeIcon,
              iconFallback: sharedStyles.typeIconFallback,
              text: sharedStyles.typeText,
            }}
          />
          {!!f.errors.selectedTypeId && <Text style={helperError}>{f.errors.selectedTypeId}</Text>}
        </InfoCard>

        <MasterButton
          title={t.edit_drink.save_changes}
          onPress={() => f.save(() => router.back())}
          disabled={f.saving}
          variant="primary"
        />
      </ScrollView>
    </ScreenContainer>
  )
}

const helperError = { marginTop: 6, color: '#d11', fontSize: 13 }
const helperWarn = { marginTop: 6, color: '#a70', fontSize: 13 }
