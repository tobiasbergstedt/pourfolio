// hooks/useFixCountry.ts
import { strings } from '@/i18n'
import { getNestedTranslation } from '@/utils/getNestedTranslation'

export default function useFixCountry() {
  return (alpha3Code: string): string => {
    const key = `countries.${alpha3Code}`
    return getNestedTranslation(strings, key, alpha3Code)
  }
}
