// types/list.ts
export type ListDrink = {
  id: string
  name: string
  image_label?: string
  type: string // drinkTypes-id (slug)
  brand?: string
  volume?: number
  rating?: number // snittbetyg (flattened)
  rating_count?: number
  alcohol_percent?: number | null
}
