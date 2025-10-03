// providers/I18nProvider.tsx
import en from '@/locales/en'
import sv from '@/locales/sv'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type Locale = 'sv' | 'en'
type Dict = typeof sv

type I18nCtx = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dict
  fmt: (template: string, vars?: Record<string, unknown>) => string
}

const I18nContext = createContext<I18nCtx | null>(null)
const STORAGE_KEY = 'app.locale'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('sv')

  useEffect(() => {
    ;(async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      if (stored === 'sv' || stored === 'en') setLocale(stored)
    })()
  }, [])

  const change = async (l: Locale) => {
    setLocale(l)
    await AsyncStorage.setItem(STORAGE_KEY, l)
  }

  const t = useMemo(() => (locale === 'sv' ? sv : en), [locale])

  // En enkel interpolator: "Hej {name}" + { name: 'Alex' } => "Hej Alex"
  const fmt = useCallback((template: string, vars?: Record<string, unknown>) => {
    if (!template || !vars) return template
    return template.replace(
      /\{(\w+)\}/g,
      (m, key) =>
        Object.prototype.hasOwnProperty.call(vars, key) && vars[key] != null ? String(vars[key]) : m // lämna okända placeholders orörda
    )
  }, [])

  return (
    <I18nContext.Provider value={{ locale, setLocale: change, t, fmt }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useStrings() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useStrings must be used within I18nProvider')
  return ctx
}
