// utils/adminValidation.ts
import { strings } from '@/i18n'
import { toNum } from './parse'

type I18nLike = {
  admin_add: {
    field_required: string
  }
}

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

export type AdminFormErrors = Partial<{
  name: string
  selectedTypeId: string
  volume: string
  alcoholPercent: string
  country: string
  ratingAverage: string
  ratingCount: string
}>

export function validateAdminForm(
  v: AdminFormValues,
  t: I18nLike = strings as unknown as I18nLike
) {
  const errors: AdminFormErrors = {}

  // Obligatoriska
  if (!v.name.trim()) errors.name = t.admin_add.field_required
  if (!v.selectedTypeId) errors.selectedTypeId = t.admin_add.field_required

  const vol = toNum(v.volume)
  if (vol === undefined || vol <= 0) {
    errors.volume = t.admin_add.field_required
  }

  const alc = toNum(v.alcoholPercent)
  if (alc === undefined || alc < 0 || alc > 100) {
    errors.alcoholPercent = t.admin_add.field_required
  }

  const canSave = !errors.name && !errors.selectedTypeId && !errors.volume && !errors.alcoholPercent

  return { errors, canSave }
}
