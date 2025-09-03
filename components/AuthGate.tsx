import { useStrings } from '@/providers/I18nProvider'
import { useRouter, useSegments } from 'expo-router'
import { onAuthStateChanged, User } from 'firebase/auth'
import { ReactNode, useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { auth } from '../lib/firebase'

export default function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const router = useRouter()
  const { t } = useStrings()
  const segments = useSegments() as string[]
  const isOnLogin = segments.join('/').startsWith('(public)/login')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u))
    return unsub
  }, [])

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text>{t.auth_gate.loading_user}</Text>
      </View>
    )
  }

  if (!user) {
    // Navigera bort – men rendera inget samtidigt (minimerar race conditions)
    if (!isOnLogin) router.replace('/(public)/login')
    return null
  }

  return <>{children}</>
}
