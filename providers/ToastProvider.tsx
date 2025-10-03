// providers/ToastProvider.tsx
import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native'

type ToastType = 'success' | 'error' | 'info'
type Ctx = { show: (msg: string, type?: ToastType, ms?: number) => void }
const ToastCtx = createContext<Ctx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string>('')
  const [type, setType] = useState<ToastType>('info')
  const [visible, setVisible] = useState(false)
  const y = useRef(new Animated.Value(60)).current
  const timer = useRef<NodeJS.Timeout | null>(null)

  const hide = useCallback(() => {
    Animated.timing(y, {
      toValue: 60,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setVisible(false)
      setMsg('')
    })
  }, [y])

  const show = useCallback(
    (message: string, t: ToastType = 'info', ms = 2200) => {
      if (timer.current) clearTimeout(timer.current)
      setMsg(message)
      setType(t)
      setVisible(true)
      Animated.timing(y, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start()
      timer.current = setTimeout(hide, ms) as unknown as NodeJS.Timeout
    },
    [hide, y]
  )

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {visible && (
        <View pointerEvents="none" style={styles.root}>
          <Animated.View
            style={[
              styles.toast,
              {
                transform: [{ translateY: y }],
                backgroundColor:
                  type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#334155',
              },
            ]}
          >
            <Text style={styles.text}>{msg}</Text>
          </Animated.View>
        </View>
      )}
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    minWidth: 160,
    maxWidth: 600,
    paddingVertical: 10,
    paddingHorizontal: 60,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  text: { color: 'white', fontWeight: '600' },
})
