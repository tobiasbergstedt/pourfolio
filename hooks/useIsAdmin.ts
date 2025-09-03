import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      // Utloggad: nollställ direkt och sluta ladda
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      // Ny user: visa loader tills vi hämtat behörighet
      setLoading(true)
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        setIsAdmin(Boolean(snap.exists() && (snap.data() as any)?.isAdmin === true))
      } catch (e) {
        console.error('[useIsAdmin] Failed to load admin status', e)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    })

    return unsub
  }, [])

  return { isAdmin, loading }
}
