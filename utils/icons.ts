// utils/icons.ts
import { FontAwesome5 } from '@expo/vector-icons'
import type { ComponentProps } from 'react'

type FA5Name = ComponentProps<typeof FontAwesome5>['name']

// Välj FA5-ikoner som finns (känn dig fri att ändra)
export const PROPERTY_ICON_MAP: Record<string, FA5Name> = {
  smokiness: 'fire',
  sweetness: 'candy-cane',
  bitterness: 'meh',
  acidity: 'tint',
  fruitiness: 'apple-alt',
  hoppiness: 'seedling',
  oak: 'tree',
  spiciness: 'pepper-hot',
  floral: 'spa',
}

export function getPropertyIconName(slug?: string | null): FA5Name {
  return (slug && PROPERTY_ICON_MAP[slug]) || 'info-circle'
}
