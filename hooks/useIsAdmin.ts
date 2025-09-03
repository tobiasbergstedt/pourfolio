import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) {
        setLoading(false)
        return
      }
      const docRef = doc(db, 'users', user.uid)
      const snap = await getDoc(docRef)

      if (snap.exists()) {
        const data = snap.data()
        setIsAdmin(data.isAdmin === true)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { isAdmin, loading }
}
