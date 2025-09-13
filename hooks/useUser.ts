// hooks/useUser.ts
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'

/** Fälten som ligger i Firestore-dokumentet: users/{uid} */
export type UserProfileDoc = {
  first_name?: string | null
  last_name?: string | null
  is_admin?: boolean | null
  profile_image?: string | null // tips: spara storage path här
  email_address?: string | null
  // ev. fler fält framöver…
}

/** Det hooken exponerar till appen */
export type UseUserResult = {
  uid: string | null
  signedIn: boolean
  loading: boolean
  error: Error | null

  // sammanslagna / härledda fält
  displayName: string
  email: string | null
  photoURL: string | null
  isAdmin: boolean

  // rådata
  authUser: FirebaseUser | null
  profile: UserProfileDoc | null
}

export function useUser(): UseUserResult {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(auth.currentUser)
  const [profile, setProfile] = useState<UserProfileDoc | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // 1) Håll Auth-state uppdaterat
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setAuthUser(u))
    return unsub
  }, [])

  // 2) Lyssna på Firestore-profilen users/{uid} när man är inloggad
  useEffect(() => {
    let unsub: Unsubscribe | undefined
    setLoading(true)
    setError(null)
    setProfile(null)

    if (authUser?.uid) {
      const ref = doc(db, 'users', authUser.uid)
      unsub = onSnapshot(
        ref,
        snap => {
          setProfile(snap.exists() ? (snap.data() as UserProfileDoc) : null)
          setLoading(false)
        },
        e => {
          setError(e as Error)
          setLoading(false)
        }
      )
    } else {
      // utloggad
      setLoading(false)
    }

    return () => {
      if (unsub) unsub()
    }
  }, [authUser?.uid])

  // 3) Härledda fält
  const displayName = useMemo(() => {
    const fn = (profile?.first_name ?? '').trim()
    const ln = (profile?.last_name ?? '').trim()
    if (fn || ln) return `${fn}${fn && ln ? ' ' : ''}${ln}`
    // fallback till Auth-displayName eller tom sträng
    return authUser?.displayName ?? ''
  }, [profile?.first_name, profile?.last_name, authUser?.displayName])

  const email = profile?.email_address?.trim() || authUser?.email || null

  // OBS: profile_image kan vara en storage-path; använd din useImageUrl i UI:t
  const photoURL = profile?.profile_image ?? authUser?.photoURL ?? null

  const isAdmin = !!profile?.is_admin

  return {
    uid: authUser?.uid ?? null,
    signedIn: !!authUser,
    loading,
    error,

    displayName,
    email,
    photoURL,
    isAdmin,

    authUser,
    profile,
  }
}
