// app/admin-edit/_layout.tsx
import BackButton from '@/components/BackButton'
import { useStrings } from '@/providers/I18nProvider'
import { Stack } from 'expo-router'

export default function AdminEditLayout() {
  const { t } = useStrings()

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
        options={{
          title: t.navigation.edit_category,
          headerLeft: ({ tintColor }) => <BackButton color={tintColor ?? 'black'} />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: t.navigation.edit_category, // back arrow shown by Stack automatically
        }}
      />
    </Stack>
  )
}
