// home/useUserProfile.ts
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

export function useUserProfile() {
  const [firstName, setFirstName] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        const snap = await getDoc(doc(db, `users/${user.uid}`))
        setFirstName(snap.data()?.first_name ?? null)
      }
    })

    return unsubscribe
  }, [])

  return firstName
}
