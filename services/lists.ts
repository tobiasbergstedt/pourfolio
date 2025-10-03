// services/lists.ts
import { auth, db } from '@/lib/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'

export async function createList(name: string): Promise<string> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')

  const listRef = await addDoc(collection(db, 'lists'), {
    name,
    ownerId: uid,
    isPersonal: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // userLists-mapping
  await setDoc(doc(db, 'userLists', uid, 'lists', listRef.id), {
    role: 'owner',
    ownerId: uid,
    listRef,
    joinedAt: serverTimestamp(),
  })

  // ✅ NY: members under listan
  await setDoc(doc(db, 'lists', listRef.id, 'members', uid), {
    role: 'owner',
    joinedAt: serverTimestamp(),
  })

  return listRef.id
}

export async function leaveList(listId: string): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')

  await deleteDoc(doc(db, 'userLists', uid, 'lists', listId))
  // ✅ NY
  await deleteDoc(doc(db, 'lists', listId, 'members', uid))
}

export async function inviteByEmail(
  listId: string,
  email: string,
  role: 'editor' | 'viewer' = 'editor'
) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')
  const listSnap = await getDoc(doc(db, 'lists', listId))
  await addDoc(collection(db, 'invites'), {
    listId,
    listName: (listSnap.data()?.name as string) ?? '',
    inviterUid: uid,
    inviteeEmailLower: email.trim().toLowerCase(),
    role,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export async function acceptInvite(inviteId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Not signed in')

  const inviteSnap = await getDoc(doc(db, 'invites', inviteId))
  const listId = inviteSnap.data()?.listId as string
  const role = (inviteSnap.data()?.role as 'editor' | 'viewer') ?? 'editor'

  await setDoc(
    doc(db, 'userLists', user.uid, 'lists', listId),
    {
      role,
      listRef: doc(db, 'lists', listId),
      joinedAt: serverTimestamp(),
      invite_id: inviteId,
    },
    { merge: true }
  )

  // ✅ NY
  await setDoc(doc(db, 'lists', listId, 'members', user.uid), {
    role,
    joinedAt: serverTimestamp(),
  })

  await updateDoc(doc(db, 'invites', inviteId), { status: 'accepted' })
}

/** SÄKER borttagning av hel lista (ägare krävs enligt reglerna). */
export async function deleteListCompletely(listId: string): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')

  const listRef = doc(db, 'lists', listId)

  // A) Kontrollera ägarskap + ej personlig
  const snap = await getDoc(listRef)
  if (!snap.exists()) throw new Error('List not found')
  const data = snap.data() as any
  if (data.ownerId !== uid) throw new Error('Only the owner can delete this list')
  if (data.isPersonal === true) throw new Error('Personal list cannot be deleted')

  // B) Hämta subcollections
  const drinksSnap = await getDocs(collection(db, 'lists', listId, 'drinks'))
  const shoppingSnap = await getDocs(collection(db, 'lists', listId, 'shopping'))

  // ✅ C) Hämta medlemmar HÄR (ingen collectionGroup)
  const membersSnap = await getDocs(collection(db, 'lists', listId, 'members'))

  // D) Batcha deletioner
  const batch = writeBatch(db)

  drinksSnap.forEach(d => batch.delete(d.ref))
  shoppingSnap.forEach(d => batch.delete(d.ref))

  // Ta bort userLists-mappingar + members-rader
  membersSnap.forEach(m => {
    const memberUid = m.id
    batch.delete(doc(db, 'userLists', memberUid, 'lists', listId))
    batch.delete(m.ref)
  })

  batch.delete(listRef)
  await batch.commit()
}
