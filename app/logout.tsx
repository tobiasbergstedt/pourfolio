// app/logout.tsx
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'

export default function LogoutScreen() {
  useEffect(() => {
    // Endast signOut; AuthGate tar hand om redirect när user blir null
    signOut(auth).catch(e => console.error('[logout] signOut failed', e))
  }, [])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  )
}
