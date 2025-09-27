// utils/adminValidation.ts
import { toNum } from './parse'

export type AdminFormValues = {
  name: string
  selectedTypeId?: string | null
  volume: string
  alcoholPercent: string

  // valfria fält:
  country?: string
  ratingAverage?: string
  ratingCount?: string
}

// Vilka felkoder som kan förekomma (utöka vid behov)
export type AdminFormErrorCode = 'field_required'

export type AdminFormErrors = Partial<{
  name: AdminFormErrorCode
  selectedTypeId: AdminFormErrorCode
  volume: AdminFormErrorCode
  alcoholPercent: AdminFormErrorCode
  country: AdminFormErrorCode
  ratingAverage: AdminFormErrorCode
  ratingCount: AdminFormErrorCode
}>

// ✅ Returnera koder – inte lokaliserade strängar
export function validateAdminForm(v: AdminFormValues) {
  const errors: AdminFormErrors = {}

  // Obligatoriska
  if (!v.name.trim()) errors.name = 'field_required'
  if (!v.selectedTypeId) errors.selectedTypeId = 'field_required'

  const vol = toNum(v.volume)
  if (vol === undefined || vol <= 0) {
    errors.volume = 'field_required'
  }

  const alc = toNum(v.alcoholPercent)
  if (alc === undefined || alc < 0 || alc > 100) {
    errors.alcoholPercent = 'field_required'
  }

  const canSave = !errors.name && !errors.selectedTypeId && !errors.volume && !errors.alcoholPercent

  return { errors, canSave }
}
