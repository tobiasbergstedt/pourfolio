// app/logout.tsx
import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { auth } from '../lib/firebase'

export default function LogoutScreen() {
  const router = useRouter()

  useEffect(() => {
    signOut(auth).finally(() => {
      router.replace('/login')
    })
  }, [router])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  )
}
