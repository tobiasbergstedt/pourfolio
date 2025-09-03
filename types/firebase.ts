import { DocumentReference } from 'firebase/firestore'

export type DrinkDocument = {
  name: string
  image_label?: string
  alcohol_percent?: number
}

export type DrinkTypeDocument = {
  name: string
  icon?: string | null
}

export type DrinkRefData = {
  quantity: number
  drink_ref: DocumentReference
  drink_type: DocumentReference
  rating: number
}
