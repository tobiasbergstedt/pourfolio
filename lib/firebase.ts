// lib/firebase.ts
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, initializeAuth, type Auth } from 'firebase/auth'

// @ts-expect-error: react-native helper saknas i vissa type
import { getReactNativePersistence } from 'firebase/auth'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { Platform } from 'react-native'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
  ...(process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
    ? { measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID as string }
    : {}),
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

let auth: Auth
if (Platform.OS === 'web') {
  auth = getAuth(app) // web använder IndexedDB/localStorage
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  } catch {
    // redan initierad (t.ex. Fast Refresh)
    auth = getAuth(app)
  }
}

const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
