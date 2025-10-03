import { auth, db } from '@/lib/firebase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { onAuthStateChanged } from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type UserList = {
  id: string // listId
  role: 'owner' | 'editor' | 'viewer'
  name?: string
  isPersonal?: boolean
}

type Ctx = {
  lists: UserList[]
  selectedListId?: string | null
  setSelectedListId: (id: string) => Promise<void>
  ensurePersonalList: () => Promise<string> // returns listId
  refresh: () => void
}

const ListCtx = createContext<Ctx | null>(null)
const STORAGE_KEY = 'active_list_id'

export function ListProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null)
  const [lists, setLists] = useState<UserList[]>([])
  const [selectedListId, setSelected] = useState<string | null>(null)

  // 🔐 Håll uid i sync med auth-state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setUid(user?.uid ?? null))
    return () => unsub()
  }, [])

  // 🔁 Lyssna på mina membership-mappingar
  useEffect(() => {
    if (!uid) {
      setLists([])
      return
    }
    const q = query(collection(db, 'userLists', uid, 'lists'))
    const unsub = onSnapshot(
      q,
      async snap => {
        try {
          const rows: UserList[] = []
          for (const d of snap.docs) {
            const role = (d.data()?.role ?? 'viewer') as UserList['role']
            const listId = d.id

            let listName: string | undefined
            let isPersonal: boolean | undefined

            try {
              const listSnap = await getDoc(doc(db, 'lists', listId))
              if (listSnap.exists()) {
                const ld = listSnap.data() as any
                listName = typeof ld?.name === 'string' ? ld.name : undefined
                isPersonal = ld?.isPersonal === true // 👈 sätt flaggan
              }
            } catch (err) {
              console.error('[ListProvider] getDoc(lists/', listId, ') failed:', err)
            }

            rows.push({ id: listId, role, name: listName, isPersonal }) // 👈 inkludera fältet
          }
          setLists(rows)
        } catch (err) {
          console.error('[ListProvider] onSnapshot error:', err)
          setLists([])
        }
      },
      err => {
        console.error('[ListProvider] onSnapshot listener error:', err)
        setLists([])
      }
    )

    return () => unsub()
  }, [uid])

  // 📦 Läs vald lista från AsyncStorage
  useEffect(() => {
    if (!uid) return
    AsyncStorage.getItem(`${STORAGE_KEY}:${uid}`).then(v => {
      if (v) setSelected(v)
    })
  }, [uid])

  const setSelectedListId = useCallback(
    async (id: string) => {
      if (!uid) return
      setSelected(id)
      await AsyncStorage.setItem(`${STORAGE_KEY}:${uid}`, id)
      // (valfritt) sync till /users/{uid}.active_list_id
      // await setDoc(doc(db, 'users', uid), { active_list_id: id }, { merge: true })
    },
    [uid]
  )

  // ✅ Skapa personlig lista om den saknas
  const ensurePersonalList = useCallback(async (): Promise<string> => {
    if (!uid) throw new Error('Not signed in')

    try {
      // 1) Leta bland mina membership-mappingar där jag är ägare
      const owned = await getDocs(
        query(collection(db, 'userLists', uid, 'lists'), where('role', '==', 'owner'))
      )

      // 2) För varje mapping (id == listId), kolla om listan är personlig
      for (const m of owned.docs) {
        const listId = m.id
        try {
          const ls = await getDoc(doc(db, 'lists', listId))
          if (ls.exists() && ls.data()?.isPersonal === true) {
            if (!selectedListId) {
              await AsyncStorage.setItem(`active_list_id:${uid}`, listId)
              setSelected(listId)
            }
            return listId
          }
        } catch (err) {
          console.error('[ListProvider] getDoc(lists/', listId, ') failed:', err)
        }
      }

      // 3) Ingen personlig lista hittad → skapa en
      const docRef = await addDoc(collection(db, 'lists'), {
        name: 'Min lista',
        ownerId: uid,
        isPersonal: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      // Owner-mapping
      await setDoc(doc(db, 'userLists', uid, 'lists', docRef.id), {
        role: 'owner',
        ownerId: uid,
        listRef: doc(db, 'lists', docRef.id),
        joinedAt: serverTimestamp(),
      })

      // Välj som aktiv om ingen vald
      if (!selectedListId) {
        await AsyncStorage.setItem(`active_list_id:${uid}`, docRef.id)
        setSelected(docRef.id)
      }

      return docRef.id
    } catch (err) {
      console.error('[ListProvider] ensurePersonalList failed:', err)
      throw err
    }
  }, [uid, selectedListId])

  const refresh = useCallback(() => {
    // onSnapshot sköter live-uppdatering; behåll stub om du vill trigga något i framtiden
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      lists,
      selectedListId,
      setSelectedListId,
      ensurePersonalList,
      refresh,
    }),
    [lists, selectedListId, setSelectedListId, ensurePersonalList, refresh]
  )

  return <ListCtx.Provider value={value}>{children}</ListCtx.Provider>
}

export function useCurrentList() {
  const ctx = useContext(ListCtx)
  if (!ctx) throw new Error('useCurrentList must be used within <ListProvider>')
  return ctx
}
