// utils/i18n.ts
// Gör utilen hook-fri och språk-agnostisk. Anroparen skickar in "t".

// Minimalt shape vi behöver ur i18n
/* =========================
   Valfri BACKWARD COMPAT:
   Om du fortfarande vill ha default-exporter som
   använder statiska `strings` kan du låta dem ligga kvar.
   De kommer dock inte uppdateras vid språkbyte i runtime.
========================= */
import { strings } from '@/i18n'

export type DrinkDict = Record<string, string> & { fallback?: string }
export type I18nLike = {
  general: {
    drink_types: DrinkDict
    properties: DrinkDict
  }
}

type Options = { fallback?: string; prettifyFallback?: boolean }

export function makeTranslator(dict: DrinkDict, dictFallback?: string) {
  const defaultFb = dictFallback ?? dict.fallback ?? '—'
  return (slug?: string | null, opts?: Options) => {
    const fb = opts?.fallback ?? defaultFb
    if (!slug) return fb
    const hit = dict[slug]
    if (hit) return hit
    if (opts?.prettifyFallback) {
      return slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }
    return fb
  }
}

// Fabrik som skapar samtliga översättare från aktuell "t"
export function makeI18nTranslators(t: I18nLike) {
  const drinkDict = t.general.drink_types
  const propDict = t.general.properties
  return {
    translateDrinkType: makeTranslator(drinkDict, drinkDict.fallback),
    translatePropertyName: makeTranslator(propDict, propDict.fallback),
  }
}
export const { translateDrinkType, translatePropertyName } = makeI18nTranslators(
  strings as unknown as I18nLike
)
