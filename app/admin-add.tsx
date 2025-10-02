// app/admin-add.tsx
import Colors from '@/assets/colors'
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
import { useAdminAddForm } from '@/hooks/useAdminAddForm'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useStrings } from '@/providers/I18nProvider'
import { translateAdminAddError } from '@/utils/i18nErrors'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AdminAddDrinkScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const { t } = useStrings()

  const addForm = useAdminAddForm()

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert(t.general.error, t.navigation.not_authorized)
      router.replace('/')
    }
  }, [adminLoading, isAdmin, router])

  if (adminLoading || addForm.loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenContainer>
    )
  }

  if (addForm.saving) {
    return <LoadingIndicator message={t.general.saving} />
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
        {/* Namn */}
        <InfoCard label={t.admin_add.name}>
          <TextInput
            value={addForm.name}
            onChangeText={addForm.setName}
            placeholder={t.admin_add.name_placeholder}
            style={editStyles.textInput}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {!!addForm.errors.name && (
            <Text style={[helperError, { alignSelf: 'flex-end' }]}>
              {translateAdminAddError(t, addForm.errors.name)}
            </Text>
          )}
        </InfoCard>
        <InfoCard label={t.admin_add.barcodes}>
          <TextInput
            value={addForm.barcodesText}
            onChangeText={addForm.setBarcodesText}
            placeholder={t.admin_add.barcodes_placeholder}
            style={[editStyles.textInput, { minHeight: 72 }]}
            multiline
            numberOfLines={3}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={[helperWarn, { alignSelf: 'flex-end' }]}>{t.admin_add.barcodes_help}</Text>
        </InfoCard>

        {/* Bild (valfri) */}
        <InfoCard label={t.admin_add.image}>
          <ImagePickerField imageUri={addForm.imageUri} onPick={addForm.pickImage} />
        </InfoCard>

        {/* Brand & Land */}
        <View style={{ flexDirection: 'row', gap: Styles.gapMain }}>
          <InfoCard label={t.admin_add.brand} style={{ flex: 1 }}>
            <TextInput
              value={addForm.brand}
              onChangeText={addForm.setBrand}
              placeholder={t.admin_add.brand_placeholder}
              style={editStyles.textInput}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </InfoCard>
          <InfoCard label={t.general.country} style={{ flex: 1 }}>
            <TextInput
              value={addForm.country}
              onChangeText={addForm.setCountry}
              placeholder={t.admin_add.country_placeholder}
              autoCapitalize="characters"
              maxLength={3}
              style={editStyles.textInput}
            />
            {!!addForm.errors.country && (
              <Text style={[helperWarn, { alignSelf: 'flex-end' }]}>
                {translateAdminAddError(t, addForm.errors.country)}
              </Text>
            )}
          </InfoCard>
        </View>

        {/* Volym & Alkohol% (OBLIGATORISKA) */}
        <View style={{ flexDirection: 'row', gap: Styles.gapMain }}>
          <InfoCard label={t.edit_drink.volume} style={{ flex: 1 }}>
            <TextInput
              value={addForm.volume}
              onChangeText={addForm.setVolume}
              placeholder={t.general.ml}
              keyboardType="numeric"
              style={editStyles.textInput}
              returnKeyType="done"
            />
            {!!addForm.errors.volume && (
              <Text style={[helperError, { alignSelf: 'flex-end' }]}>
                {translateAdminAddError(t, addForm.errors.volume)}
              </Text>
            )}
          </InfoCard>
          <InfoCard label={t.edit_drink.alcohol} style={{ flex: 1 }}>
            <TextInput
              value={addForm.alcoholPercent}
              onChangeText={addForm.setAlcoholPercent}
              placeholder={t.admin_add.percentage_placeholder}
              keyboardType="decimal-pad"
              style={editStyles.textInput}
            />
            {!!addForm.errors.alcoholPercent && (
              <Text style={[helperError, { alignSelf: 'flex-end' }]}>
                {translateAdminAddError(t, addForm.errors.alcoholPercent)}
              </Text>
            )}
          </InfoCard>
        </View>

        {/* Beskrivning */}
        <InfoCard label={t.edit_drink.description}>
          <TextInput
            value={addForm.description}
            onChangeText={addForm.setDescription}
            placeholder={t.edit_drink.description_placeholder}
            style={[editStyles.textInput, { minHeight: 88 }]}
            multiline
            numberOfLines={4}
          />
        </InfoCard>

        {/* Rating */}
        <View style={{ flexDirection: 'row', gap: Styles.gapMain }}>
          <InfoCard label={t.admin_add.amount_of_ratings} style={{ flex: 1 }}>
            <TextInput
              value={addForm.ratingCount}
              onChangeText={addForm.setRatingCount}
              placeholder="0"
              keyboardType="numeric"
              style={editStyles.textInput}
            />
            {!!addForm.errors.ratingCount && (
              <Text style={[helperWarn, { alignSelf: 'flex-end' }]}>
                {translateAdminAddError(t, addForm.errors.ratingCount)}
              </Text>
            )}
          </InfoCard>
          <InfoCard label={t.admin_add.average_rating} style={{ flex: 1 }}>
            <TextInput
              value={addForm.ratingAverage}
              onChangeText={addForm.setRatingAverage}
              placeholder="0–5"
              keyboardType="decimal-pad"
              style={editStyles.textInput}
            />
            {!!addForm.errors.ratingAverage && (
              <Text style={[helperWarn, { alignSelf: 'flex-end' }]}>
                {translateAdminAddError(t, addForm.errors.ratingAverage)}
              </Text>
            )}
          </InfoCard>
        </View>

        {/* Pairing suggestions */}
        <InfoCard label={t.edit_drink.pairing_suggestions}>
          <TextInput
            value={addForm.pairingSuggestions}
            onChangeText={addForm.setPairingSuggestions}
            placeholder={t.edit_drink.pairing_suggestions_placeholder}
            style={[editStyles.textInput, { minHeight: 72 }]}
            multiline
            numberOfLines={3}
          />
        </InfoCard>

        {/* Properties */}
        <InfoCard label={t.edit_drink.properties}>
          <PropertyList rows={addForm.properties} setRows={addForm.setProperties} />
        </InfoCard>

        {/* Where to find */}
        <InfoCard label={t.edit_drink.where_to_find}>
          <WhereToFindList rows={addForm.whereToFind} setRows={addForm.setWhereToFind} />
        </InfoCard>

        {/* Kategori (OBLIGATORISK) */}
        <InfoCard label={t.add_drink.choose_category}>
          <CategoryGrid
            data={addForm.drinkTypes}
            selectedId={addForm.selectedType?.id}
            onSelect={addForm.setSelectedType}
            styleOverrides={{
              cell: sharedStyles.typeCell,
              cellActive: sharedStyles.typeCellActive,
              icon: sharedStyles.typeIcon,
              iconFallback: sharedStyles.typeIconFallback,
              text: sharedStyles.typeText,
            }}
          />
          {!!addForm.errors.selectedTypeId && (
            <Text style={[helperError, { alignSelf: 'flex-end' }]}>
              {translateAdminAddError(t, addForm.errors.selectedTypeId)}
            </Text>
          )}
        </InfoCard>

        {/* CTA:s */}
        <MasterButton
          title={t.admin_add.save_and_add_more}
          onPress={() => addForm.save(false)}
          disabled={!addForm.canSave || addForm.saving}
          variant="primary"
        />
        <MasterButton
          title={t.admin_add.save_and_go_home}
          onPress={() => addForm.save(true, () => router.replace('/'))}
          disabled={!addForm.canSave || addForm.saving}
          variant="secondary"
        />
      </ScrollView>
    </ScreenContainer>
  )
}

const helperError = {
  marginTop: 6,
  color: Colors.danger,
  fontSize: Styles.fontSizeSmall,
  marginRight: Styles.marginPaddingMini,
}
const helperWarn = {
  marginTop: 6,
  color: Colors.warningText,
  fontSize: Styles.fontSizeSmall,
  marginRight: Styles.marginPaddingMini,
}
