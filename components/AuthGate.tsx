// components/AuthGate.tsx
import { auth } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { Redirect } from 'expo-router'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

export default function AuthGate({ children }: { children: ReactNode }) {
  // undefined = okänt (init), null = utloggad, User = inloggad
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const { t } = useStrings()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return unsub
  }, [])

  // Init: visa loader
  if (user === undefined) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>{t.auth_gate.loading_user}</Text>
      </View>
    )
  }

  // Utloggad: deklarativ redirect (säker, ingen imperativ state-uppdatering i render)
  if (user === null) {
    return <Redirect href="/(public)/login" />
  }

  // Inloggad
  return <>{children}</>
}
