import Styles from '@/assets/styles'
import AdminCategoryRow from '@/components/admin-edit/AdminCategoryRow'
import InfoCard from '@/components/InfoCard'
import LoadingIndicator from '@/components/LoadingIndicator'
import ScreenContainer from '@/components/ScreenContainer'
import { useAdminCategoryList } from '@/hooks/useAdminCategoryList'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useStrings } from '@/providers/I18nProvider'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { Alert, Platform, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AdminCategoriesIndexScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const list = useAdminCategoryList()
  const { t } = useStrings()

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert(t.general.error, t.navigation?.not_authorized)
      router.replace('/')
    }
  }, [adminLoading, isAdmin, router])

  if (adminLoading || list.loading) {
    return <LoadingIndicator message={t.general.loading} />
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
        <InfoCard label={t.admin_edit.categories}>
          {list.categories.length === 0 ? (
            <Text style={{ color: '#777' }}>{t.general.no_results_found}</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {list.categories.map(c => (
                <AdminCategoryRow
                  key={c.id}
                  category={c}
                  onPress={() =>
                    router.push({ pathname: '/admin-categories/[id]', params: { id: c.id } })
                  }
                />
              ))}
            </View>
          )}
        </InfoCard>
      </ScrollView>
    </ScreenContainer>
  )
}
