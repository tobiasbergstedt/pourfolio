// app/scan.tsx
import { useIsFocused } from '@react-navigation/native'
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'

import Colors from '@/assets/colors'
import ScreenContainer from '@/components/ScreenContainer'
import { db } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'

export default function ScanScreen() {
  const router = useRouter()
  const { t } = useStrings()
  const [permission, requestPermission] = useCameraPermissions()

  // ⬇️ Viktigt: bara kör kameran när skärmen är i fokus
  const isFocused = useIsFocused()

  // Styr debounce och “på/av” för scan
  const [scanning, setScanning] = useState(true)

  // Be om permission en gång
  useEffect(() => {
    if (!permission) requestPermission()
  }, [permission, requestPermission])

  // När skärmen fokuseras → tillåt scanning och camera-mount
  // När den blur:as → stoppa scanning (och vi unmount:ar kameran via conditional render)
  useEffect(() => {
    if (isFocused) {
      setScanning(true)
    } else {
      setScanning(false)
    }
  }, [isFocused])

  const handleScan = useCallback(
    async (result: BarcodeScanningResult) => {
      if (!scanning) return
      setScanning(false) // debounce

      try {
        const code = result?.data?.trim()
        if (!code) {
          setScanning(true)
          return
        }

        // 🔎 Matcha mot array-fältet "barcodes"
        const q = query(
          collection(db, 'drinks'),
          where('barcodes', 'array-contains', code),
          limit(1)
        )
        const snap = await getDocs(q)

        if (!snap.empty) {
          const drinkDoc = snap.docs[0]
          const data = drinkDoc.data() as any
          const typeRef = data?.drink_type
          const typeId = typeRef?.id

          // Navigera bort – skärmen blur:as → kameran unmount:as (pga isFocused false)
          router.replace({
            pathname: '/add',
            params: {
              drinkId: drinkDoc.id,
              ...(typeId ? { typeId } : {}),
              fromScan: '1',
            },
          })
        } else {
          Alert.alert(
            t.scan.not_found_title,
            t.scan.not_found_message?.replace('{code}', code) ?? t.scan.not_found_message,
            [
              {
                text: t.general.cancel,
                onPress: () => router.replace({ pathname: '/', params: { barcode: code } }),
              },
              {
                text: t.scan.try_again,
                onPress: () => setScanning(true),
                style: 'cancel',
              },
            ]
          )
        }
      } catch (e: any) {
        Alert.alert(t.general.error, e?.message ?? String(e))
        setScanning(true)
      }
    },
    [router, scanning, t]
  )

  // Permission-state vyer
  if (!permission) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    )
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.text}>{t.scan.permission}</Text>
        </View>
      </ScreenContainer>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Rendera kameran BARA när skärmen är i fokus → frigör resurser korrekt */}
      {isFocused ? (
        <CameraView
          key="camera-focused" // tvinga full remount när vi kommer tillbaka
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'],
          }}
          onBarcodeScanned={scanning ? handleScan : undefined}
        />
      ) : (
        // Placeholder när ej fokuserad → inget kameraobjekt i minnet
        <View style={{ flex: 1 }} />
      )}

      <View style={styles.overlay}>
        <Text style={styles.helperText}>{t.scan.helper}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, textAlign: 'center' },
  overlay: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  helperText: { color: Colors.white, fontWeight: '600' },
})
