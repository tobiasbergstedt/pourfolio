import Styles from '@/assets/styles'
import ImagePickerField from '@/components/admin-add/ImagePickerField'
import InfoCard from '@/components/InfoCard'
import LoadingIndicator from '@/components/LoadingIndicator'
import MasterButton from '@/components/MasterButton'
import ScreenContainer from '@/components/ScreenContainer'
import { useAdminCategoryEdit } from '@/hooks/useAdminCategoryEdit'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useStrings } from '@/providers/I18nProvider'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { Alert, Platform, ScrollView, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AdminCategoryEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const { t } = useStrings()

  const f = useAdminCategoryEdit(id)

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert(t.general.error, t.navigation?.not_authorized)
      router.replace('/')
    }
  }, [adminLoading, isAdmin, router])

  if (adminLoading || f.loading) return <LoadingIndicator message={t.general.loading} />
  if (f.notFound) {
    return (
      <ScreenContainer>
        <InfoCard label={t.general.error}>
          <Text>{t.general.no_results_found}</Text>
        </InfoCard>
      </ScreenContainer>
    )
  }
  if (f.saving) return <LoadingIndicator message={t.general.saving} />

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
        {/* Slug/id – icke redigerbart */}
        <InfoCard label={t.admin_edit.slug_id}>
          <Text style={{ fontSize: 16 }}>{f.slug}</Text>
        </InfoCard>

        {/* Visningsnamn – icke redigerbart (hämtat från doc) */}
        <InfoCard label={t.admin_add.name}>
          <Text style={{ fontSize: 16 }}>{f.displayName || t.general.dash}</Text>
        </InfoCard>

        {/* Bild – redigerbar via ImagePicker */}
        <InfoCard label={t.admin_add.image}>
          <ImagePickerField imageUri={f.imagePreviewUri} onPick={f.pickImage} />
        </InfoCard>

        <MasterButton
          title={t.edit_drink.save_changes}
          onPress={() => f.save(() => router.back())}
          disabled={f.saving || !f.canSave}
          variant="primary"
        />
      </ScrollView>
    </ScreenContainer>
  )
}
