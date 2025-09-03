export function getNestedTranslation(obj: any, path: string, fallback?: string): string {
  const parts = path.split('.')
  let result = obj

  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part]
    } else {
      return fallback || path
    }
  }

  return typeof result === 'string' ? result : fallback || path
}
