// app/(public)/_layout.tsx
import BackButton from '@/components/BackButton'
import { useStrings } from '@/providers/I18nProvider'
import { Drawer } from 'expo-router/drawer'

export default function PublicLayout() {
  const { t } = useStrings()

  return (
    <Drawer>
      <Drawer.Screen name="login" options={{ title: t.login.sign_in }} />
      <Drawer.Screen
        name="register"
        options={{
          title: t.login.register,
          headerLeft: ({ tintColor }) => <BackButton color={tintColor ?? 'black'} />,
        }}
      />
      <Drawer.Screen
        name="reset-password"
        options={{
          title: t.login.reset_password,
          headerLeft: ({ tintColor }) => <BackButton color={tintColor ?? 'black'} />,
        }}
      />
    </Drawer>
  )
}
