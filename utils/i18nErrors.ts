// utils/i18nErrors.ts
import type { AdminFormErrorCode } from './adminValidation'

// Minimal typ för t (du kan ersätta med din riktiga i18n-typ)
type I18nLike = {
  admin_add: {
    field_required: string
  }
  general?: {
    something_went_wrong?: string
  }
}

export function translateAdminAddError(t: I18nLike, code?: AdminFormErrorCode): string | undefined {
  if (!code) return undefined
  switch (code) {
    case 'field_required':
      return t.admin_add.field_required
    default:
      return t.general?.something_went_wrong ?? 'Error'
  }
}
