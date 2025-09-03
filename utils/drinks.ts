// utils/drinks.ts
import type { ListDrink } from '@/types/list'
import type { DocumentReference } from 'firebase/firestore'

// Minimalt i18n-shape vi behöver här
type I18nLike = {
  general: {
    non_alcoholic: string
    vol: string
  }
}

/**
 * Plattar ut ett drink-dokument från Firestore till ListDrink.
 * Helt språk-agnostisk (ingen hook, ingen i18n här).
 */
export function flattenDrinkDoc(data: any, id: string): ListDrink | null {
  if (!data?.drink_type || !data?.name) return null

  const typeRef = data.drink_type as DocumentReference | undefined

  const r = data.rating ?? {}
  const avg =
    typeof r.average_rating === 'number'
      ? r.average_rating
      : typeof r.averageRating === 'number'
        ? r.averageRating
        : 0

  const count =
    typeof r.number_of_ratings === 'number'
      ? r.number_of_ratings
      : typeof r.amount_of_ratings === 'number'
        ? r.amount_of_ratings
        : 0

  const alcohol =
    typeof data.alcohol_percent === 'number'
      ? data.alcohol_percent
      : typeof data.alcoholPercent === 'number'
        ? data.alcoholPercent
        : null

  return {
    id,
    name: String(data.name),
    image_label: data.image_label ?? undefined,
    type: typeRef?.id ?? '',
    brand: data.brand ?? undefined,
    volume: typeof data.volume === 'number' ? data.volume : undefined,
    rating: avg,
    rating_count: count,
    alcohol_percent: alcohol,
  }
}

/**
 * Formatterar alkoholtext på rätt språk.
 * Skicka in `t` från useStrings(); om du hoppar över det får du själv
 * hantera default-värden där du anropar funktionen.
 */
export function formatAlcoholText(alcohol_percent?: number | null, t?: I18nLike): string {
  if (alcohol_percent == null) return '—'
  if (!t) {
    // Fallback utan i18n – håll den neutral om t saknas
    return alcohol_percent <= 1.5 ? 'Alcohol-free' : `${alcohol_percent}% vol.`
  }
  return alcohol_percent <= 1.5 ? t.general.non_alcoholic : `${alcohol_percent}% ${t.general.vol}.`
}

/** Hämta bildens URL från nya/äldre fält */
export function getDrinkImageUrl(d?: { image_value?: string; image_label?: string }) {
  return d?.image_value ?? d?.image_label ?? null
}
